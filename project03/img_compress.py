#!/usr/bin/env python3
import os
import argparse
from pathlib import Path
from PIL import Image


class ImageCompressor:
    """图片压缩工具类"""
    
    SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}
    
    def __init__(self, quality=85, recursive=False, output_dir=None, formats=None):
        """
        初始化图片压缩器
        
        Args:
            quality: 压缩质量 (1-100)，默认85
            recursive: 是否递归处理子目录
            output_dir: 输出目录，None则覆盖原文件
            formats: 支持的图片格式列表，None则使用默认支持的格式
        """
        self.quality = quality
        self.recursive = recursive
        self.output_dir = Path(output_dir) if output_dir else None
        self.formats = formats or self.SUPPORTED_FORMATS
    
    def is_supported_format(self, file_path):
        """检查文件是否是支持的图片格式"""
        return file_path.suffix.lower() in self.formats
    
    def compress_image(self, input_path, output_path=None):
        """
        压缩单张图片
        
        Args:
            input_path: 输入图片路径
            output_path: 输出图片路径，None则覆盖原文件
        
        Returns:
            dict: 包含压缩前后大小和压缩率的信息
        """
        input_path = Path(input_path)
        output_path = Path(output_path) if output_path else input_path
        
        # 获取原始文件大小
        original_size = input_path.stat().st_size
        
        # 打开图片
        with Image.open(input_path) as img:
            # 处理EXIF方向信息
            img = self._apply_exif_orientation(img)
            
            # 确保输出目录存在
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 根据格式设置保存参数
            save_kwargs = {}
            format_ext = input_path.suffix.lower()
            
            if format_ext in ['.jpg', '.jpeg']:
                # JPEG格式
                if img.mode in ('RGBA', 'LA', 'P'):
                    # 转换为RGB模式
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        background.paste(img, mask=img.split()[3])
                    else:
                        background.paste(img, mask=img.split()[1])
                    img = background
                save_kwargs['quality'] = self.quality
                save_kwargs['optimize'] = True
                
            elif format_ext == '.png':
                # PNG格式 - 使用优化参数
                save_kwargs['optimize'] = True
                # 根据质量设置压缩级别（1-9）
                compression_level = max(1, min(9, int((100 - self.quality) / 10) + 1))
                save_kwargs['compress_level'] = compression_level
                
            elif format_ext == '.webp':
                # WebP格式
                save_kwargs['quality'] = self.quality
                save_kwargs['method'] = 6  # 较高的压缩方法，平衡速度和质量
                
            else:
                # 其他格式
                save_kwargs['quality'] = self.quality
            
            # 保存压缩后的图片
            img.save(output_path, **save_kwargs)
        
        # 获取压缩后的文件大小
        compressed_size = output_path.stat().st_size
        compression_ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0
        
        return {
            'input': str(input_path),
            'output': str(output_path),
            'original_size': original_size,
            'compressed_size': compressed_size,
            'compression_ratio': compression_ratio
        }
    
    def _apply_exif_orientation(self, img):
        """应用EXIF方向信息"""
        try:
            # 获取EXIF数据
            exif = img._getexif()
            if exif is None:
                return img
            
            # 方向标签 (0x0112)
            orientation = exif.get(0x0112)
            if orientation is None:
                return img
            
            # 根据方向旋转/翻转图片
            if orientation == 2:
                # 水平翻转
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
            elif orientation == 3:
                # 旋转180度
                img = img.transpose(Image.ROTATE_180)
            elif orientation == 4:
                # 垂直翻转
                img = img.transpose(Image.FLIP_TOP_BOTTOM)
            elif orientation == 5:
                # 水平翻转后旋转90度
                img = img.transpose(Image.FLIP_LEFT_RIGHT).transpose(Image.ROTATE_90)
            elif orientation == 6:
                # 旋转270度
                img = img.transpose(Image.ROTATE_270)
            elif orientation == 7:
                # 水平翻转后旋转270度
                img = img.transpose(Image.FLIP_LEFT_RIGHT).transpose(Image.ROTATE_270)
            elif orientation == 8:
                # 旋转90度
                img = img.transpose(Image.ROTATE_90)
        
        except (AttributeError, KeyError, IndexError):
            # 如果没有EXIF数据或处理出错，返回原图
            pass
        
        return img
    
    def get_image_files(self, directory):
        """
        获取目录中的所有图片文件
        
        Args:
            directory: 目录路径
        
        Returns:
            list: 图片文件路径列表
        """
        directory = Path(directory)
        image_files = []
        
        if self.recursive:
            # 递归查找所有文件
            for root, dirs, files in os.walk(directory):
                for file in files:
                    file_path = Path(root) / file
                    if self.is_supported_format(file_path):
                        image_files.append(file_path)
        else:
            # 只查找当前目录
            for file in directory.iterdir():
                if file.is_file() and self.is_supported_format(file):
                    image_files.append(file)
        
        return image_files
    
    def compress_directory(self, directory):
        """
        压缩目录中的所有图片
        
        Args:
            directory: 目录路径
        
        Returns:
            list: 每个图片的压缩结果列表
        """
        directory = Path(directory)
        
        if not directory.exists():
            raise ValueError(f"目录不存在: {directory}")
        
        if not directory.is_dir():
            raise ValueError(f"不是一个目录: {directory}")
        
        # 获取所有图片文件
        image_files = self.get_image_files(directory)
        
        if not image_files:
            print(f"在目录 {directory} 中没有找到支持的图片文件")
            return []
        
        print(f"找到 {len(image_files)} 个图片文件，准备压缩...")
        print("-" * 60)
        
        results = []
        total_original = 0
        total_compressed = 0
        
        for image_file in image_files:
            try:
                # 计算输出路径
                if self.output_dir:
                    # 保持相对目录结构
                    rel_path = image_file.relative_to(directory)
                    output_path = self.output_dir / rel_path
                else:
                    output_path = None
                
                # 压缩图片
                result = self.compress_image(image_file, output_path)
                results.append(result)
                
                # 统计信息
                total_original += result['original_size']
                total_compressed += result['compressed_size']
                
                # 显示进度
                original_mb = result['original_size'] / 1024 / 1024
                compressed_mb = result['compressed_size'] / 1024 / 1024
                print(f"✓ {image_file.name}")
                print(f"  原始: {original_mb:.2f} MB → 压缩后: {compressed_mb:.2f} MB")
                print(f"  压缩率: {result['compression_ratio']:.2f}%")
                print()
                
            except Exception as e:
                print(f"✗ 压缩失败 {image_file.name}: {e}")
        
        # 显示汇总
        print("-" * 60)
        print("压缩完成!")
        
        if total_original > 0:
            total_original_mb = total_original / 1024 / 1024
            total_compressed_mb = total_compressed / 1024 / 1024
            total_ratio = (1 - total_compressed / total_original) * 100
            
            print(f"总原始大小: {total_original_mb:.2f} MB")
            print(f"总压缩后大小: {total_compressed_mb:.2f} MB")
            print(f"总压缩率: {total_ratio:.2f}%")
            print(f"节省空间: {(total_original - total_compressed) / 1024 / 1024:.2f} MB")
        
        return results


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='图片压缩工具 - 批量压缩文件夹中的图片',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  # 压缩当前目录中的所有图片（覆盖原文件）
  python img_compress.py .
  
  # 压缩指定目录中的图片，质量为75
  python img_compress.py /path/to/images --quality 75
  
  # 递归压缩子目录中的图片，输出到新目录
  python img_compress.py /path/to/images --recursive --output /path/to/output
  
  # 只压缩JPEG和PNG格式的图片
  python img_compress.py /path/to/images --formats jpg png
        '''
    )
    
    parser.add_argument(
        'directory',
        help='包含图片的目录路径'
    )
    
    parser.add_argument(
        '-q', '--quality',
        type=int,
        default=85,
        choices=range(1, 101),
        metavar='1-100',
        help='压缩质量 (1-100)，默认85'
    )
    
    parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='递归处理子目录中的图片'
    )
    
    parser.add_argument(
        '-o', '--output',
        type=str,
        help='输出目录，不指定则覆盖原文件'
    )
    
    parser.add_argument(
        '-f', '--formats',
        nargs='+',
        default=['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
        help='支持的图片格式列表，默认支持所有常见格式'
    )
    
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_args()
    
    # 标准化格式列表（添加点号）
    formats = {f'.{f.lower().lstrip(".")}' for f in args.formats}
    
    # 创建压缩器实例
    compressor = ImageCompressor(
        quality=args.quality,
        recursive=args.recursive,
        output_dir=args.output,
        formats=formats
    )
    
    # 压缩目录中的图片
    try:
        compressor.compress_directory(args.directory)
    except Exception as e:
        print(f"错误: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
