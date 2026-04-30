"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockProduct = generateMockProduct;
const reviewService_1 = require("./reviewService");
function generateMockProduct(url, platform) {
    const isJD = platform === 'jd';
    const jdProducts = [
        {
            title: 'Apple iPhone 15 Pro Max 256GB 原色钛金属 移动联通电信5G手机',
            price: '9999.00',
            brand: 'Apple',
            image: 'https://img14.360buyimg.com/n1/jfs/t1/197770/14/25336/19777064f8989c78d514c93d4.jpg',
            params: [
                { key: '品牌', value: 'Apple' },
                { key: '商品名称', value: 'Apple iPhone 15 Pro Max' },
                { key: '商品编号', value: '100123456789' },
                { key: 'CPU型号', value: 'A17 Pro' },
                { key: '机身内存', value: '256GB' },
                { key: '颜色', value: '原色钛金属' },
                { key: '机身色系', value: '蓝色' }
            ]
        },
        {
            title: '华为 HUAWEI Mate 60 Pro 12GB+512GB 雅丹黑 卫星通话',
            price: '6999.00',
            brand: '华为HUAWEI',
            image: 'https://img10.360buyimg.com/n1/jfs/t1/182550/36/27000/123456/64f8989c78d514c93d4.jpg',
            params: [
                { key: '品牌', value: '华为 HUAWEI' },
                { key: '商品名称', value: '华为Mate 60 Pro' },
                { key: 'CPU型号', value: '麒麟9000S' },
                { key: '机身内存', value: '512GB' },
                { key: '颜色', value: '雅丹黑' },
                { key: '电池容量', value: '5000mAh' }
            ]
        },
        {
            title: '小米14 Pro 16GB+1TB 黑色 骁龙8 Gen3处理器',
            price: '5999.00',
            brand: '小米MI',
            image: 'https://img12.360buyimg.com/n1/jfs/t1/200000/10/20000/100000/65000000d514c93d4.jpg',
            params: [
                { key: '品牌', value: '小米' },
                { key: '商品名称', value: '小米14 Pro' },
                { key: 'CPU型号', value: '骁龙8 Gen3' },
                { key: '机身内存', value: '1TB' },
                { key: '颜色', value: '黑色' },
                { key: '充电功率', value: '120W' }
            ]
        }
    ];
    const tmallProducts = [
        {
            title: 'Nike Air Jordan 1 高帮篮球鞋 黑白熊猫 男女同款',
            price: '1299.00',
            brand: 'Nike官方旗舰店',
            image: 'https://img.alicdn.com/imgextra/i4/123456789/O1CN01ABCDEF1a1b2c3d4e5f_!!0-item_pic.jpg',
            params: [
                { key: '品牌', value: 'Nike/耐克' },
                { key: '鞋码', value: '36-45码' },
                { key: '颜色分类', value: '黑白熊猫' },
                { key: '吊牌价', value: '1299' },
                { key: '上市年份季节', value: '2024年春季' },
                { key: '鞋帮高度', value: '高帮' }
            ]
        },
        {
            title: '戴森V15 Detect无线吸尘器 手持除螨',
            price: '4990.00',
            brand: '戴森官方旗舰店',
            image: 'https://img.alicdn.com/imgextra/i3/987654321/O1CN01ZYXWVU1q1a1b2c3d4e5f_!!0-item_pic.jpg',
            params: [
                { key: '品牌', value: 'Dyson/戴森' },
                { key: '型号', value: 'V15 Detect' },
                { key: '功能', value: '吸尘 除螨' },
                { key: '吸尘器类型', value: '手持式' },
                { key: '最大噪音', value: '81dB' },
                { key: '续航时间', value: '60分钟' }
            ]
        },
        {
            title: 'SK-II神仙水护肤精华露230ml 补水保湿',
            price: '1590.00',
            brand: 'SK-II官方旗舰店',
            image: 'https://img.alicdn.com/imgextra/i2/111222333/O1CN01SKIIIII1a1b2c3d4e5f_!!0-item_pic.jpg',
            params: [
                { key: '品牌', value: 'SK-II' },
                { key: '规格类型', value: '正常规格' },
                { key: '功效', value: '补水 保湿 提亮肤色' },
                { key: '化妆品净含量', value: '230ml' },
                { key: '适合肤质', value: '任何肤质' },
                { key: '产地', value: '日本' }
            ]
        }
    ];
    const products = isJD ? jdProducts : tmallProducts;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    return {
        ...randomProduct,
        url,
        platform,
        reviewAnalysis: (0, reviewService_1.generateReviewAnalysis)(randomProduct.title)
    };
}
