#!/usr/bin/env python3
import os
import argparse
import shutil
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
    
    def get_files(self, directory):
        """
        获取目录中的所有图片文件
        
        Args:
            directory: 目录路径
        
        Returns:
            list: 图片文件路径列表
        """
        directory = Path(directory)
        files = []
        
        if self.recursive:
            # 递归查找所有文件
            for root, dirs, file_names in os.walk(directory):
                for file_name in file_names:
                    file_path = Path(root) / file_name
                    if self.is_supported_format(file_path):
                        files.append(file_path)
        else:
            # 只查找当前目录
            for file in directory.iterdir():
                if file.is_file() and self.is_supported_format(file):
                    files.append(file)
        
        return files
    
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
        files = self.get_files(directory)
        
        if not files:
            print(f"在目录 {directory} 中没有找到支持的图片文件")
            return []
        
        print(f"找到 {len(files)} 个图片文件，准备压缩...")
        print("-" * 60)
        
        results = []
        total_original = 0
        total_compressed = 0
        
        for file_path in files:
            try:
                # 计算输出路径
                if self.output_dir:
                    # 保持相对目录结构
                    rel_path = file_path.relative_to(directory)
                    output_path = self.output_dir / rel_path
                else:
                    output_path = None
                
                # 压缩图片
                result = self.compress_image(file_path, output_path)
                results.append(result)
                
                # 统计信息
                total_original += result['original_size']
                total_compressed += result['compressed_size']
                
                # 显示进度
                original_mb = result['original_size'] / 1024 / 1024
                compressed_mb = result['compressed_size'] / 1024 / 1024
                print(f"✓ {file_path.name}")
                print(f"  原始: {original_mb:.2f} MB → 压缩后: {compressed_mb:.2f} MB")
                print(f"  压缩率: {result['compression_ratio']:.2f}%")
                print()
                
            except Exception as e:
                print(f"✗ 压缩失败 {file_path.name}: {e}")
        
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


class VideoCompressor:
    """视频压缩工具类"""
    
    SUPPORTED_FORMATS = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'}
    
    def __init__(self, quality='medium', recursive=False, output_dir=None, 
                 formats=None, codec='libx264', fps=None, resolution=None, 
                 audio_bitrate='128k'):
        """
        初始化视频压缩器
        
        Args:
            quality: 压缩质量预设 ('low', 'medium', 'high', 'ultra') 或 CRF 值 (18-28)
            recursive: 是否递归处理子目录
            output_dir: 输出目录，None则覆盖原文件
            formats: 支持的视频格式列表
            codec: 视频编码器 (libx264, libx265, mpeg4)
            fps: 帧率，None则保持原帧率
            resolution: 分辨率缩放 (如 '1280x720')，None则保持原分辨率
            audio_bitrate: 音频比特率，默认 '128k'
        """
        self.quality = quality
        self.recursive = recursive
        self.output_dir = Path(output_dir) if output_dir else None
        self.formats = formats or self.SUPPORTED_FORMATS
        self.codec = codec
        self.fps = fps
        self.resolution = resolution
        self.audio_bitrate = audio_bitrate
        
        # 质量预设到 CRF 值的映射
        self._quality_map = {
            'low': 28,
            'medium': 23,
            'high': 20,
            'ultra': 18
        }
    
    def is_supported_format(self, file_path):
        """检查文件是否是支持的视频格式"""
        return file_path.suffix.lower() in self.formats
    
    def _get_crf_value(self):
        """获取 CRF 压缩值"""
        if isinstance(self.quality, (int, float)):
            return max(0, min(51, int(self.quality)))
        elif isinstance(self.quality, str):
            if self.quality.lower() in self._quality_map:
                return self._quality_map[self.quality.lower()]
            try:
                return max(0, min(51, int(self.quality)))
            except ValueError:
                return 23  # 默认中等质量
        return 23
    
    def compress_video(self, input_path, output_path=None):
        """
        压缩单张视频
        
        Args:
            input_path: 输入视频路径
            output_path: 输出视频路径，None则覆盖原文件
        
        Returns:
            dict: 包含压缩前后大小和压缩率的信息
        """
        try:
            from moviepy.editor import VideoFileClip
            from moviepy.video.fx.all import resize
        except ImportError:
            raise ImportError("需要安装 moviepy 库: pip install moviepy")
        
        input_path = Path(input_path)
        
        # 如果没有指定输出路径，创建临时文件
        temp_output = False
        if output_path is None:
            # 创建临时输出文件
            temp_output = True
            output_path = input_path.with_suffix(f'.compressed{input_path.suffix}')
        else:
            output_path = Path(output_path)
        
        # 获取原始文件大小
        original_size = input_path.stat().st_size
        
        try:
            # 加载视频
            clip = VideoFileClip(str(input_path))
            
            # 应用帧率调整
            if self.fps:
                clip = clip.set_fps(self.fps)
            
            # 应用分辨率调整
            if self.resolution:
                try:
                    width, height = map(int, self.resolution.lower().split('x'))
                    clip = resize(clip, newsize=(width, height))
                except ValueError:
                    print(f"  警告: 无效的分辨率格式 '{self.resolution}'，忽略此设置")
            
            # 确保输出目录存在
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 获取 CRF 值
            crf = self._get_crf_value()
            
            # 导出压缩后的视频
            clip.write_videofile(
                str(output_path),
                codec=self.codec,
                audio_codec='aac',
                audio_bitrate=self.audio_bitrate,
                preset='medium',
                ffmpeg_params=['-crf', str(crf)]
            )
            
            # 关闭 clip
            clip.close()
            
            # 如果是临时输出，替换原文件
            if temp_output:
                original_backup = input_path.with_suffix(f'.original{input_path.suffix}')
                # 备份原文件
                shutil.move(str(input_path), str(original_backup))
                # 将压缩后的文件重命名为原文件名
                shutil.move(str(output_path), str(input_path))
                output_path = input_path
                
                # 可以选择删除备份文件，这里保留备份以防万一
                # original_backup.unlink()
            
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
            
        except Exception as e:
            # 清理临时文件
            if temp_output and output_path.exists():
                output_path.unlink()
            raise e
    
    def get_files(self, directory):
        """
        获取目录中的所有视频文件
        
        Args:
            directory: 目录路径
        
        Returns:
            list: 视频文件路径列表
        """
        directory = Path(directory)
        files = []
        
        if self.recursive:
            # 递归查找所有文件
            for root, dirs, file_names in os.walk(directory):
                for file_name in file_names:
                    file_path = Path(root) / file_name
                    if self.is_supported_format(file_path):
                        files.append(file_path)
        else:
            # 只查找当前目录
            for file in directory.iterdir():
                if file.is_file() and self.is_supported_format(file):
                    files.append(file)
        
        return files
    
    def compress_directory(self, directory):
        """
        压缩目录中的所有视频
        
        Args:
            directory: 目录路径
        
        Returns:
            list: 每个视频的压缩结果列表
        """
        directory = Path(directory)
        
        if not directory.exists():
            raise ValueError(f"目录不存在: {directory}")
        
        if not directory.is_dir():
            raise ValueError(f"不是一个目录: {directory}")
        
        # 获取所有视频文件
        files = self.get_files(directory)
        
        if not files:
            print(f"在目录 {directory} 中没有找到支持的视频文件")
            return []
        
        print(f"找到 {len(files)} 个视频文件，准备压缩...")
        print(f"质量设置: {self.quality}")
        if self.fps:
            print(f"目标帧率: {self.fps} fps")
        if self.resolution:
            print(f"目标分辨率: {self.resolution}")
        print("-" * 60)
        
        results = []
        total_original = 0
        total_compressed = 0
        
        for file_path in files:
            try:
                print(f"正在处理: {file_path.name}")
                
                # 计算输出路径
                if self.output_dir:
                    # 保持相对目录结构
                    rel_path = file_path.relative_to(directory)
                    output_path = self.output_dir / rel_path
                else:
                    output_path = None
                
                # 压缩视频
                result = self.compress_video(file_path, output_path)
                results.append(result)
                
                # 统计信息
                total_original += result['original_size']
                total_compressed += result['compressed_size']
                
                # 显示进度
                original_mb = result['original_size'] / 1024 / 1024
                compressed_mb = result['compressed_size'] / 1024 / 1024
                print(f"✓ {file_path.name}")
                print(f"  原始: {original_mb:.2f} MB → 压缩后: {compressed_mb:.2f} MB")
                print(f"  压缩率: {result['compression_ratio']:.2f}%")
                print()
                
            except Exception as e:
                print(f"✗ 压缩失败 {file_path.name}: {e}")
                print()
        
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
        description='媒体压缩工具 - 批量压缩图片或视频',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
图片压缩示例:
  # 压缩当前目录中的所有图片（覆盖原文件）
  python compress.py image .
  
  # 压缩指定目录中的图片，质量为75
  python compress.py image /path/to/images --quality 75
  
  # 递归压缩子目录中的图片，输出到新目录
  python compress.py image /path/to/images --recursive --output /path/to/output
  
  # 只压缩JPEG和PNG格式的图片
  python compress.py image /path/to/images --formats jpg png

视频压缩示例:
  # 压缩当前目录中的所有视频（覆盖原文件）
  python compress.py video .
  
  # 使用高质量预设压缩视频
  python compress.py video /path/to/videos --quality high
  
  # 压缩视频并指定分辨率和帧率
  python compress.py video /path/to/videos --resolution 1280x720 --fps 30
  
  # 递归压缩子目录中的视频，输出到新目录
  python compress.py video /path/to/videos --recursive --output /path/to/output
        '''
    )
    
    # 创建子命令解析器
    subparsers = parser.add_subparsers(dest='mode', help='压缩模式')
    
    # 图片压缩子命令
    image_parser = subparsers.add_parser('image', help='图片压缩模式')
    image_parser.add_argument(
        'directory',
        help='包含图片的目录路径'
    )
    image_parser.add_argument(
        '-q', '--quality',
        type=int,
        default=85,
        choices=range(1, 101),
        metavar='1-100',
        help='压缩质量 (1-100)，默认85'
    )
    image_parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='递归处理子目录中的图片'
    )
    image_parser.add_argument(
        '-o', '--output',
        type=str,
        help='输出目录，不指定则覆盖原文件'
    )
    image_parser.add_argument(
        '-f', '--formats',
        nargs='+',
        default=['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
        help='支持的图片格式列表，默认支持所有常见格式'
    )
    
    # 视频压缩子命令
    video_parser = subparsers.add_parser('video', help='视频压缩模式')
    video_parser.add_argument(
        'directory',
        help='包含视频的目录路径'
    )
    video_parser.add_argument(
        '-q', '--quality',
        type=str,
        default='medium',
        choices=['low', 'medium', 'high', 'ultra'],
        help='压缩质量预设 (low/medium/high/ultra)，默认 medium'
    )
    video_parser.add_argument(
        '--crf',
        type=int,
        default=None,
        metavar='0-51',
        help='手动指定 CRF 值 (0-51，越低质量越好)，会覆盖 --quality 选项'
    )
    video_parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='递归处理子目录中的视频'
    )
    video_parser.add_argument(
        '-o', '--output',
        type=str,
        help='输出目录，不指定则覆盖原文件'
    )
    video_parser.add_argument(
        '-f', '--formats',
        nargs='+',
        default=['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm'],
        help='支持的视频格式列表，默认支持所有常见格式'
    )
    video_parser.add_argument(
        '--codec',
        type=str,
        default='libx264',
        choices=['libx264', 'libx265', 'mpeg4'],
        help='视频编码器，默认 libx264'
    )
    video_parser.add_argument(
        '--fps',
        type=int,
        default=None,
        help='目标帧率，不指定则保持原帧率'
    )
    video_parser.add_argument(
        '--resolution',
        type=str,
        default=None,
        metavar='WIDTHxHEIGHT',
        help='目标分辨率 (如 1280x720)，不指定则保持原分辨率'
    )
    video_parser.add_argument(
        '--audio-bitrate',
        type=str,
        default='128k',
        help='音频比特率，默认 128k'
    )
    
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_args()
    
    if not args.mode:
        print("错误: 请指定压缩模式 (image 或 video)")
        print("使用 --help 查看详细帮助")
        return 1
    
    try:
        if args.mode == 'image':
            # 图片压缩模式
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
            compressor.compress_directory(args.directory)
            
        elif args.mode == 'video':
            # 视频压缩模式
            # 标准化格式列表（添加点号）
            formats = {f'.{f.lower().lstrip(".")}' for f in args.formats}
            
            # 确定质量值
            quality = args.crf if args.crf is not None else args.quality
            
            # 创建压缩器实例
            compressor = VideoCompressor(
                quality=quality,
                recursive=args.recursive,
                output_dir=args.output,
                formats=formats,
                codec=args.codec,
                fps=args.fps,
                resolution=args.resolution,
                audio_bitrate=args.audio_bitrate
            )
            
            # 压缩目录中的视频
            compressor.compress_directory(args.directory)
        
    except Exception as e:
        print(f"错误: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
