from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
import os
import json
import re
import random
from urllib.parse import urljoin, urlparse
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

NEWS_TYPES = [
    "综合", "科技", "财经", "体育", "娱乐", "教育", "健康", 
    "社会", "军事", "汽车", "房产", "旅游", "美食", "时尚"
]

PLATFORM_TYPES = [
    "微信公众号", "小红书", "今日头条", "微博", "抖音文案"
]

TITLE_PREFIXES = {
    '微信公众号': {
        '科技': ['科技前沿：', '技术突破：', 'AI观察：', '数码解析：', '创新动态：'],
        '财经': ['财经洞察：', '市场分析：', '投资解读：', '经济观察：', '金融热点：'],
        '体育': ['体育快讯：', '赛事前瞻：', '运动分析：', '竞技看点：', '体坛热点：'],
        '娱乐': ['娱乐热点：', '明星动态：', '影视资讯：', '综艺追踪：', '音乐前沿：'],
        '教育': ['教育观察：', '学习分享：', '升学指导：', '培训资讯：', '校园动态：'],
        '健康': ['健康资讯：', '医疗科普：', '养生指南：', '疾病预防：', '心理健康：'],
        '社会': ['社会观察：', '民生热点：', '公益资讯：', '社区动态：', '百姓生活：'],
        '军事': ['军事动态：', '国防观察：', '武器解析：', '军情速递：', '战略分析：'],
        '汽车': ['汽车资讯：', '新车发布：', '试驾评测：', '行业动态：', '出行观察：'],
        '房产': ['房产资讯：', '楼市观察：', '置业指南：', '家装分享：', '物业动态：'],
        '旅游': ['旅游攻略：', '出行指南：', '景点推荐：', '游记分享：', '度假资讯：'],
        '美食': ['美食探店：', '烹饪技巧：', '食材解析：', '餐厅推荐：', '厨艺分享：'],
        '时尚': ['时尚资讯：', '穿搭指南：', '美妆分享：', '品牌动态：', '潮流观察：'],
        '综合': ['深度解析：', '独家报道：', '专家视角：', '热点追踪：', '行业观察：']
    },
    '小红书': {
        '科技': ['数码好物：', '科技感拉满！', '程序员日常：', 'AI太牛了！', '黑科技分享：'],
        '财经': ['理财干货：', '搞钱必看！', '投资小白：', '存钱攻略：', '搞钱日记：'],
        '体育': ['运动打卡：', '健身干货：', '球赛分享：', '运动穿搭：', '健身日常：'],
        '娱乐': ['追星日常：', '明星同款：', '剧荒推荐：', '综艺安利：', '歌单分享：'],
        '教育': ['学习打卡：', '考研上岸：', '考证攻略：', '学习方法：', '育儿分享：'],
        '健康': ['养生日常：', '健康饮食：', '运动打卡：', '护肤分享：', '心理健康：'],
        '社会': ['生活感悟：', '人间真实：', '日常分享：', '社畜日常：', '生活记录：'],
        '军事': ['硬核科普：', '军迷日常：', '装备解析：', '历史分享：', '策略分析：'],
        '汽车': ['爱车日常：', '提车日记：', '改装分享：', '汽车好物：', '自驾攻略：'],
        '房产': ['装修日记：', '租房改造：', '家居好物：', '买房攻略：', '收纳分享：'],
        '旅游': ['旅行日记：', '攻略分享：', '酒店推荐：', '拍照技巧：', '假期安排：'],
        '美食': ['美食探店：', '做饭教程：', '零食分享：', '餐厅推荐：', '减脂食谱：'],
        '时尚': ['穿搭分享：', '美妆教程：', '好物推荐：', '品牌测评：', '日常穿搭：'],
        '综合': ['救命！', '谁懂啊！', '姐妹们！', '亲测有效！', '巨好用！']
    },
    '今日头条': {
        '科技': ['科技快报：', 'AI快讯：', '数码资讯：', '技术突破：', '互联网动态：'],
        '财经': ['财经快讯：', '股市动态：', '经济观察：', '投资机会：', '金融政策：'],
        '体育': ['体育快讯：', '赛事快报：', '体坛热点：', '竞技风云：', '运动资讯：'],
        '娱乐': ['娱乐快讯：', '明星八卦：', '影视快讯：', '综艺热点：', '音乐动态：'],
        '教育': ['教育快讯：', '升学资讯：', '培训动态：', '校园热点：', '考试信息：'],
        '健康': ['健康快讯：', '医疗资讯：', '养生指南：', '疾病预防：', '健康科普：'],
        '社会': ['社会快讯：', '民生热点：', '突发事件：', '现场直击：', '社会观察：'],
        '军事': ['军事快讯：', '国防动态：', '军情速递：', '装备解析：', '战略观察：'],
        '汽车': ['汽车快讯：', '新车资讯：', '行业动态：', '交通观察：', '出行资讯：'],
        '房产': ['房产快讯：', '楼市动态：', '房价走势：', '政策解读：', '家居资讯：'],
        '旅游': ['旅游快讯：', '出行资讯：', '景点动态：', '假期攻略：', '旅行推荐：'],
        '美食': ['美食快讯：', '餐饮资讯：', '食品安全：', '健康饮食：', '美食推荐：'],
        '时尚': ['时尚快讯：', '潮流动态：', '品牌资讯：', '美妆动态：', '穿搭推荐：'],
        '综合': ['突发！', '最新消息：', '刚刚！', '紧急通知：', '深度解析：']
    },
    '微博': {
        '科技': ['#科技圈#', '#数码#', '#AI#', '#互联网#', '#程序员#'],
        '财经': ['#股票#', '#基金#', '#投资理财#', '#经济#', '#楼市#'],
        '体育': ['#NBA#', '#足球#', '#奥运会#', '#健身#', '#体育#'],
        '娱乐': ['#明星#', '#电影#', '#电视剧#', '#综艺#', '#音乐#'],
        '教育': ['#考研#', '#高考#', '#留学#', '#教育#', '#学习#'],
        '健康': ['#健康#', '#医疗#', '#养生#', '#健身#', '#心理健康#'],
        '社会': ['#社会热点#', '#民生#', '#生活#', '#公益#', '#百姓话题#'],
        '军事': ['#军事#', '#国防#', '#武器#', '#军迷#', '#历史#'],
        '汽车': ['#汽车#', '#新能源汽车#', '#买车#', '#自驾#', '#改装#'],
        '房产': ['#房产#', '#买房#', '#租房#', '#装修#', '#房价#'],
        '旅游': ['#旅游#', '#旅行#', '#攻略#', '#景点#', '#假期#'],
        '美食': ['#美食#', '#探店#', '#做饭#', '#零食#', '#减脂餐#'],
        '时尚': ['#穿搭#', '#美妆#', '#时尚#', '#品牌#', '#好物分享#'],
        '综合': ['#热门话题#', '刚刚！', '震惊！', '热议：', '突发！']
    },
    '抖音文案': {
        '科技': ['数码好物：', '黑科技：', '程序员日常：', 'AI太牛了：', '技术干货：'],
        '财经': ['搞钱必看：', '理财干货：', '投资小白：', '存钱攻略：', '赚钱思维：'],
        '体育': ['运动打卡：', '健身干货：', '球赛精彩：', '运动日常：', '自律打卡：'],
        '娱乐': ['明星日常：', '追剧推荐：', '综艺搞笑：', '音乐推荐：', '八卦爆料：'],
        '教育': ['学习方法：', '考试技巧：', '育儿经验：', '成长日记：', '知识分享：'],
        '健康': ['养生知识：', '健康饮食：', '健身教程：', '护肤分享：', '心理疏导：'],
        '社会': ['生活感悟：', '人间真实：', '正能量：', '生活记录：', '日常分享：'],
        '军事': ['硬核科普：', '历史故事：', '装备解析：', '战略分析：', '军迷日常：'],
        '汽车': ['爱车日常：', '驾驶技巧：', '汽车知识：', '自驾攻略：', '用车分享：'],
        '房产': ['装修日记：', '租房改造：', '家居好物：', '买房经验：', '收纳技巧：'],
        '旅游': ['旅行日记：', '景点推荐：', '拍照技巧：', '美食探店：', '攻略分享：'],
        '美食': ['做饭教程：', '美食探店：', '零食分享：', '减脂食谱：', '厨房好物：'],
        '时尚': ['穿搭教程：', '美妆技巧：', '好物推荐：', '品牌测评：', '日常穿搭：'],
        '综合': ['别划走！', '看完泪目！', '太真实了！', '一定要看完！', '赶紧收藏！']
    }
}

NEWS_TYPE_SPECIFIC_PREFIXES = {
    '科技': {
        'emojis': ['🤖', '💻', '📱', '🖥️', '🔬', '⚡', '🚀'],
        'themes': ['人工智能', '数字科技', '互联网', '创新', '未来'],
    },
    '财经': {
        'emojis': ['💰', '📈', '📊', '💹', '🏦', '💎', '📉'],
        'themes': ['投资理财', '市场分析', '经济动态', '财富管理', '商业洞察'],
    },
    '体育': {
        'emojis': ['⚽', '🏀', '🎾', '🏆', '🏃', '⚡', '💪'],
        'themes': ['竞技体育', '运动健身', '赛事分析', '体坛风云', '运动精神'],
    },
    '娱乐': {
        'emojis': ['🎬', '🎤', '🎵', '💃', '🌟', '🎭', '📺'],
        'themes': ['明星八卦', '影视资讯', '音乐潮流', '综艺娱乐', '娱乐圈'],
    },
    '教育': {
        'emojis': ['📚', '🎓', '✏️', '📖', '🏫', '💡', '🧠'],
        'themes': ['学习成长', '教育资讯', '升学指导', '知识分享', '教育培训'],
    },
    '健康': {
        'emojis': ['🏥', '💊', '🏃', '🥗', '💤', '❤️', '🧘'],
        'themes': ['健康生活', '医疗资讯', '养生保健', '疾病预防', '心理健康'],
    },
    '社会': {
        'emojis': ['🏙️', '👥', '🏠', '🌍', '🤝', '📰', '⚖️'],
        'themes': ['社会民生', '百姓生活', '公益事业', '社区动态', '人间百态'],
    },
    '军事': {
        'emojis': ['🎖️', '⚔️', '🛡️', '🚁', '🚢', '🎯', '🔭'],
        'themes': ['国防建设', '军事科技', '军情观察', '战略分析', '武器装备'],
    },
    '汽车': {
        'emojis': ['🚗', '🚙', '⚡', '🛣️', '🔧', '⛽', '🚘'],
        'themes': ['汽车资讯', '新车测评', '行业动态', '出行生活', '汽车文化'],
    },
    '房产': {
        'emojis': ['🏠', '🏢', '🔨', '🛋️', '🪴', '💰', '📐'],
        'themes': ['房产资讯', '楼市分析', '装修设计', '家居生活', '置业指南'],
    },
    '旅游': {
        'emojis': ['✈️', '🗺️', '🏖️', '⛰️', '📸', '🎒', '🌅'],
        'themes': ['旅行攻略', '景点推荐', '美食探店', '出行指南', '度假生活'],
    },
    '美食': {
        'emojis': ['🍜', '🍔', '🍰', '☕', '🍷', '🥘', '🍳'],
        'themes': ['美食探店', '烹饪技巧', '食材分享', '餐厅推荐', '饮食文化'],
    },
    '时尚': {
        'emojis': ['👗', '👠', '💄', '👜', '⌚', '🕶️', '💎'],
        'themes': ['时尚穿搭', '美妆教程', '品牌测评', '潮流资讯', '生活美学'],
    },
    '综合': {
        'emojis': ['📢', '💡', '🔍', '📊', '✨', '📰', '🎯'],
        'themes': ['热点资讯', '深度解读', '行业观察', '社会热点', '新闻速递'],
    }
}

EMOJIS = {
    '微信公众号': ['📢', '💡', '🔍', '📊', '✨', '📰', '🎯', '📌'],
    '小红书': ['💕', '🥰', '🔥', '💯', '🌟', '✨', '💫', '🌸', '🎀', '💖'],
    '今日头条': ['🚨', '📰', '⚡', '🎯', '📌', '🔥', '💥', '🌐'],
    '微博': ['🔥', '💥', '🌶️', '👀', '💬', '😂', '😭', '👍', '🙏'],
    '抖音文案': ['🎬', '🎥', '💫', '⏰', '💎', '🔥', '💔', '✨']
}

class NewsExtractor:
    EXCLUDE_KEYWORDS = [
        '客户端', '下载', 'app', 'APP', '登录', '注册', '首页', '导航',
        '联系我们', '关于我们', '隐私政策', '服务条款', '广告', '招聘',
        '订阅', '邮件', '反馈', '帮助', '客服', '微博', '微信', '公众号',
        '扫一扫', '二维码', '手机版', '移动版', '触屏版', '电脑版',
        '新浪财经', '新浪体育', '新浪娱乐', '新浪科技', '新浪新闻',
        '新浪众测', '新浪公开课', '新浪邮箱', '新浪游戏', '新浪汽车'
    ]
    
    NEWS_KEYWORDS = [
        'news', 'article', 'detail', 'content', 'view', 'read', 'story',
        '新闻', '文章', '详情', '内容', '查看', '阅读', '报道', '消息',
        '最新', '热点', '独家', '深度', '专题', '滚动', '即时'
    ]
    
    DATE_PATTERNS = [
        r'\d{4}年\d{1,2}月\d{1,2}日',
        r'\d{4}-\d{1,2}-\d{1,2}',
        r'\d{1,2}月\d{1,2}日',
        r'\d{2}:\d{2}',
    ]
    
    NEWS_TYPE_KEYWORDS = {
        '科技': [
            '科技', '技术', '互联网', 'IT', '人工智能', 'AI', '大数据', '云计算',
            '5G', '芯片', '软件', '硬件', '手机', '电脑', '数码', '电子',
            '科技', '创新', '研发', '专利', '技术', '互联网', '程序员',
            'tech', 'technology', 'AI', 'software', 'hardware', 'digital'
        ],
        '财经': [
            '财经', '金融', '股票', '股市', '基金', '投资', '理财', '银行',
            '证券', '保险', '期货', '外汇', '汇率', '利率', '经济', 'GDP',
            '通胀', '物价', '房价', '楼市', '股市', '牛市', '熊市', '涨停',
            'finance', 'stock', 'economy', 'investment', 'bank', 'money'
        ],
        '体育': [
            '体育', '足球', '篮球', 'NBA', 'CBA', '世界杯', '欧洲杯', '奥运会',
            '网球', '羽毛球', '乒乓球', '游泳', '田径', '健身', '运动', '赛事',
            '冠军', '亚军', '季军', '金牌', '银牌', '铜牌', '联赛', '中超',
            'sports', 'football', 'basketball', 'tennis', 'olympic', 'game'
        ],
        '娱乐': [
            '娱乐', '明星', '电影', '电视剧', '综艺', '音乐', '歌手', '演员',
            '导演', '票房', '收视率', '绯闻', '八卦', '演唱会', '专辑', '新歌',
            '红毯', '颁奖', '奖项', '电影节', '音乐节', '时尚', '美妆',
            'entertainment', 'movie', 'film', 'music', 'star', 'celebrity'
        ],
        '教育': [
            '教育', '学校', '大学', '中学', '小学', '幼儿园', '学生', '教师',
            '考试', '高考', '考研', '留学', '培训', '课程', '学习', '知识',
            '学历', '学位', '毕业', '入学', '招生', '就业', '实习', '奖学金',
            'education', 'school', 'university', 'student', 'teacher', 'exam'
        ],
        '健康': [
            '健康', '医疗', '医院', '医生', '药品', '疾病', '治疗', '疫苗',
            '疫情', '病毒', '细菌', '癌症', '心脏病', '糖尿病', '高血压',
            '养生', '保健', '健身', '营养', '饮食', '睡眠', '心理健康', '体检',
            'health', 'medical', 'hospital', 'doctor', 'disease', 'medicine'
        ],
        '社会': [
            '社会', '民生', '民生', '百姓', '生活', '城市', '农村', '社区',
            '公益', '慈善', '志愿者', '环保', '气候', '天气', '灾害', '事故',
            '案件', '警方', '法院', '法律', '维权', '投诉', '举报', '调查',
            'society', 'social', 'community', 'people', 'life', 'public'
        ],
        '军事': [
            '军事', '军队', '部队', '军人', '武器', '装备', '导弹', '战机',
            '军舰', '坦克', '航母', '演习', '阅兵', '国防', '战争', '冲突',
            '维和', '反恐', '安全', '情报', '雷达', '卫星', '核弹', '军区',
            'military', 'army', 'war', 'weapon', 'defense', 'soldier'
        ],
        '汽车': [
            '汽车', '轿车', 'SUV', '电动车', '新能源', '特斯拉', '比亚迪',
            '造车', '车企', '4S店', '车展', '驾照', '学车', '加油', '充电',
            '发动机', '变速箱', '底盘', '轮胎', '导航', '自动驾驶', '智能汽车',
            'car', 'auto', 'automobile', 'vehicle', 'electric', 'tesla'
        ],
        '房产': [
            '房产', '房地产', '房子', '买房', '卖房', '租房', '房价', '楼市',
            '开发商', '楼盘', '小区', '物业', '装修', '家具', '家电', '房贷',
            '公积金', '限购', '限购', '房价', '涨价', '降价', '开盘', '交房',
            'house', 'apartment', 'real estate', 'property', 'home', 'building'
        ],
        '旅游': [
            '旅游', '旅行', '出行', '机票', '酒店', '景点', '景区', '门票',
            '旅行社', '导游', '攻略', '游记', '签证', '护照', '机票', '高铁',
            '自驾游', '跟团游', '自由行', '民宿', '度假', '休闲', '黄金周',
            'travel', 'trip', 'tourism', 'hotel', 'flight', 'vacation'
        ],
        '美食': [
            '美食', '餐饮', '餐厅', '饭店', '菜品', '食材', '烹饪', '厨艺',
            '美食家', '吃货', '探店', '外卖', '火锅', '烧烤', '奶茶', '咖啡',
            '甜点', '零食', '水果', '蔬菜', '肉类', '海鲜', '素食', '健康餐',
            'food', 'restaurant', 'cooking', 'eat', 'delicious', 'cuisine'
        ],
        '时尚': [
            '时尚', '时装', '服装', '服饰', '品牌', '奢侈品', '包包', '鞋子',
            '配饰', '珠宝', '手表', '化妆品', '护肤品', '美妆', '穿搭', '潮流',
            '设计师', '时装周', '秀场', '模特', '网红', '博主', '种草', '拔草',
            'fashion', 'style', 'clothing', 'brand', 'luxury', 'beauty'
        ]
    }
    
    @staticmethod
    def detect_news_type(title, url='', summary=''):
        type_scores = {}
        text_to_check = f"{title} {url} {summary}".lower()
        
        for news_type, keywords in NewsExtractor.NEWS_TYPE_KEYWORDS.items():
            score = 0
            for kw in keywords:
                kw_lower = kw.lower()
                if kw_lower in text_to_check:
                    score += 1
                    if kw in title or kw in summary:
                        score += 1
            
            type_scores[news_type] = score
        
        sorted_types = sorted(type_scores.items(), key=lambda x: x[1], reverse=True)
        
        if sorted_types[0][1] > 0:
            return sorted_types[0][0]
        
        path_segments = urlparse(url).path.lower().split('/')
        for segment in path_segments:
            for news_type, keywords in NewsExtractor.NEWS_TYPE_KEYWORDS.items():
                for kw in keywords:
                    if kw.lower() in segment:
                        return news_type
        
        return '综合'
    
    @staticmethod
    def is_type_match(detected_type, target_type):
        if target_type == '综合' or target_type is None:
            return True
        return detected_type == target_type
    
    @staticmethod
    def normalize_title_for_dedup(title):
        if not title:
            return ''
        title = re.sub(r'[^\u4e00-\u9fff\w\s]', '', title)
        title = re.sub(r'\s+', '', title)
        return title.lower()
    
    @staticmethod
    def get_base_url(url):
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}"
    
    @staticmethod
    def clean_text(text):
        if not text:
            return ''
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[\n\r\t]', ' ', text)
        return text.strip()
    
    @staticmethod
    def is_valid_news_title(title):
        if not title or len(title) < 5:
            return False
        
        for kw in NewsExtractor.EXCLUDE_KEYWORDS:
            if kw in title:
                return False
        
        if len(title) > 50:
            return False
        
        if title.isdigit() or title.replace('.', '', 1).isdigit():
            return False
        
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', title))
        if chinese_chars < 3:
            return False
        
        return True
    
    @staticmethod
    def is_news_url(url, title=''):
        if not url:
            return False
        
        parsed = urlparse(url)
        if not parsed.path or parsed.path == '/' or parsed.path == '':
            return False
        
        for kw in ['login', 'register', 'download', 'app', 'client', 'search', 
                   '登录', '注册', '下载', '搜索', '客服', '帮助', '关于', 
                   '联系', '招聘', '广告', '订阅', '反馈']:
            if kw in url.lower():
                return False
        
        for kw in NewsExtractor.NEWS_KEYWORDS:
            if kw in url.lower() or (title and kw in title):
                return True
        
        if re.search(r'\d{4,}', url):
            return True
        
        if re.search(r'/\d{6,}/', url):
            return True
        
        if re.search(r'[/-]\d{8}[/-]', url):
            return True
        
        for pattern in NewsExtractor.DATE_PATTERNS:
            if re.search(pattern, title):
                return True
        
        path_parts = parsed.path.strip('/').split('/')
        if len(path_parts) >= 2:
            return True
        
        return False
    
    @staticmethod
    def extract_news_from_page(url, target_type=None, limit=10):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.baidu.com/'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.encoding = response.apparent_encoding
            soup = BeautifulSoup(response.text, 'lxml')
            
            for script in soup(['script', 'style', 'nav', 'footer', 'aside', 'header']):
                script.decompose()
            
            base_url = NewsExtractor.get_base_url(url)
            all_candidates = []
            seen_urls = set()
            seen_titles = set()
            
            priority_selectors = [
                {'selector': 'a[href*="news"] a, a[href*="article"] a', 'type': 'nested'},
                {'selector': 'h1 a, h2 a, h3 a, h4 a', 'type': 'heading'},
                {'selector': '.news-item a, .article-item a, .list-item a', 'type': 'item'},
                {'selector': '[class*="news"] a, [class*="article"] a, [class*="item"] a', 'type': 'class'},
            ]
            
            for sel_config in priority_selectors:
                links = soup.select(sel_config['selector'])
                for link in links:
                    href = link.get('href', '')
                    if not href or 'javascript' in href.lower():
                        continue
                    
                    full_url = urljoin(base_url, href)
                    
                    if full_url in seen_urls:
                        continue
                    
                    if not NewsExtractor.is_news_url(full_url):
                        continue
                    
                    title = NewsExtractor.clean_text(link.get_text())
                    if not NewsExtractor.is_valid_news_title(title):
                        parent = link.find_parent(['h1', 'h2', 'h3', 'h4', 'div', 'li'])
                        if parent:
                            title = NewsExtractor.clean_text(parent.get_text())
                    
                    if not NewsExtractor.is_valid_news_title(title):
                        continue
                    
                    normalized_title = NewsExtractor.normalize_title_for_dedup(title)
                    if normalized_title in seen_titles:
                        continue
                    
                    summary = NewsExtractor.extract_summary_from_element(link.find_parent())
                    if not summary:
                        summary = NewsExtractor.generate_summary_from_title(title)
                    
                    detected_type = NewsExtractor.detect_news_type(title, full_url, summary)
                    
                    seen_urls.add(full_url)
                    seen_titles.add(normalized_title)
                    all_candidates.append({
                        'id': len(all_candidates) + 1,
                        'title': title[:80],
                        'url': full_url,
                        'summary': summary,
                        'news_type': detected_type,
                        '_match_score': 1 if NewsExtractor.is_type_match(detected_type, target_type) else 0
                    })
            
            if len(all_candidates) < limit * 2:
                all_links = soup.find_all('a', href=True)
                for link in all_links:
                    href = link.get('href', '')
                    if not href or 'javascript' in href.lower():
                        continue
                    
                    full_url = urljoin(base_url, href)
                    if full_url in seen_urls:
                        continue
                    
                    if not NewsExtractor.is_news_url(full_url):
                        continue
                    
                    title = NewsExtractor.clean_text(link.get_text())
                    if not NewsExtractor.is_valid_news_title(title):
                        parent = link.find_parent(['h1', 'h2', 'h3', 'h4', 'div', 'li', 'p'])
                        if parent:
                            title = NewsExtractor.clean_text(parent.get_text())
                    
                    if not NewsExtractor.is_valid_news_title(title):
                        continue
                    
                    normalized_title = NewsExtractor.normalize_title_for_dedup(title)
                    if normalized_title in seen_titles:
                        continue
                    
                    summary = NewsExtractor.generate_summary_from_title(title)
                    detected_type = NewsExtractor.detect_news_type(title, full_url, summary)
                    
                    seen_urls.add(full_url)
                    seen_titles.add(normalized_title)
                    all_candidates.append({
                        'id': len(all_candidates) + 1,
                        'title': title[:80],
                        'url': full_url,
                        'summary': summary,
                        'news_type': detected_type,
                        '_match_score': 1 if NewsExtractor.is_type_match(detected_type, target_type) else 0
                    })
            
            all_candidates.sort(key=lambda x: x['_match_score'], reverse=True)
            
            filtered_news = []
            for news in all_candidates:
                if target_type and target_type != '综合':
                    if news['_match_score'] == 1:
                        filtered_news.append(news)
                else:
                    filtered_news.append(news)
                
                if len(filtered_news) >= limit:
                    break
            
            for idx, news in enumerate(filtered_news):
                news['id'] = idx + 1
                if '_match_score' in news:
                    del news['_match_score']
            
            return filtered_news[:limit]
        
        except Exception as e:
            print(f"Error extracting news: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    @staticmethod
    def extract_summary_from_element(element):
        if not element:
            return ''
        
        summary_selectors = [
            '.summary', '.desc', '.description', '.abstract', '.excerpt',
            '.intro', '.content', '.text', 'p'
        ]
        
        for selector in summary_selectors:
            elem = element.select_one(selector)
            if elem:
                text = NewsExtractor.clean_text(elem.get_text())
                if text and len(text) > 10:
                    return text[:200]
        
        all_p = element.find_all('p')
        for p in all_p:
            text = NewsExtractor.clean_text(p.get_text())
            if text and len(text) > 15:
                return text[:200]
        
        all_text = NewsExtractor.clean_text(element.get_text())
        if all_text and len(all_text) > 20:
            return all_text[:200]
        
        return ''
    
    @staticmethod
    def generate_summary_from_title(title):
        if not title:
            return ''
        
        templates = [
            f'本文主要报道了"{title}"相关的最新消息。该事件引发了广泛关注，让我们一起来了解详细情况。',
            f'关于"{title}"的新闻正在持续发酵。据了解，这一事件涉及多个方面，值得我们深入了解。',
            f'最新报道："{title}"。这一消息一经发布，便引起了社会各界的广泛讨论和关注。',
            f'今日热点："{title}"。本文将为您详细解读这一事件的来龙去脉和重要意义。',
        ]
        
        return random.choice(templates)
    
    @staticmethod
    def fetch_article_detail(url):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.encoding = response.apparent_encoding
            soup = BeautifulSoup(response.text, 'lxml')
            
            for script in soup(['script', 'style', 'nav', 'footer', 'aside', 'header']):
                script.decompose()
            
            content_selectors = [
                '.article-content', '.article-body', '.news-content', '.news-body',
                '.content', '.article', '#article-content', '#news-content',
                '.main-content', '.post-content', '.entry-content',
                'article', '[class*="content"]', '[class*="article"]'
            ]
            
            article_text = ''
            for selector in content_selectors:
                elem = soup.select_one(selector)
                if elem:
                    paragraphs = elem.find_all('p')
                    for p in paragraphs:
                        text = NewsExtractor.clean_text(p.get_text())
                        if text and len(text) > 10:
                            article_text += text + '\n\n'
                    
                    if len(article_text) > 100:
                        break
            
            if not article_text:
                all_p = soup.find_all('p')
                for p in all_p:
                    text = NewsExtractor.clean_text(p.get_text())
                    if text and len(text) > 20:
                        article_text += text + '\n\n'
            
            return article_text[:3000]
        
        except Exception as e:
            print(f"Error fetching article detail: {e}")
            return ''


class SmartContentGenerator:
    @staticmethod
    def rewrite_title(title, platform_type, news_type='综合'):
        platform_prefixes = TITLE_PREFIXES.get(platform_type, TITLE_PREFIXES['微信公众号'])
        
        if isinstance(platform_prefixes, dict):
            prefixes = platform_prefixes.get(news_type, platform_prefixes.get('综合', []))
            if not prefixes:
                prefixes = platform_prefixes.get('综合', [])
        else:
            prefixes = platform_prefixes
        
        type_specific = NEWS_TYPE_SPECIFIC_PREFIXES.get(news_type, NEWS_TYPE_SPECIFIC_PREFIXES['综合'])
        type_emojis = type_specific.get('emojis', EMOJIS.get(platform_type, EMOJIS['微信公众号']))
        
        if prefixes:
            prefix = random.choice(prefixes)
        else:
            prefix = ''
        
        emoji = random.choice(type_emojis)
        
        if platform_type == '小红书':
            variations = [
                f'{emoji} {prefix}{title}！' if prefix else f'{emoji} {title}！',
                f'{emoji} {title}真的绝了！',
                f'{emoji} {title}！看完我惊呆了！',
                f'{emoji} 关于{title}，我想说...',
                f'{emoji} {title}这也太好看/好听/好用了吧！',
            ]
        elif platform_type == '抖音文案':
            variations = [
                f'{emoji} {title}！别划走！',
                f'{emoji} {title}！看完我沉默了！',
                f'{emoji} {title}！99%的人都不知道！',
                f'{emoji} 今天说个事：{title}',
                f'{emoji} {title}！看完不哭算我输！',
            ]
        elif platform_type == '微博':
            variations = [
                f'{emoji} 【{title}】',
                f'{emoji} {prefix}{title}' if prefix else f'{emoji} {title}',
                f'{emoji} 热搜：{title}',
                f'{emoji} 热议：{title}',
                f'{emoji} {title}！太狠了！',
            ]
        elif platform_type == '今日头条':
            variations = [
                f'{emoji} {prefix}{title}' if prefix else f'{emoji} {title}',
                f'{emoji} 最新消息：{title}',
                f'{emoji} 深度解析：{title}',
                f'{emoji} 刚刚！{title}',
                f'{emoji} 重磅！{title}',
            ]
        else:
            variations = [
                f'{emoji} {prefix}{title}' if prefix else f'{emoji} {title}',
                f'{emoji} 深度解读：{title}',
                f'{emoji} 专家分析：{title}',
                f'{emoji} 行业观察：{title}',
                f'{emoji} 热点聚焦：{title}',
            ]
        
        return random.choice(variations)
    
    @staticmethod
    def generate_article_content(news_data, platform_type, full_content=''):
        title = news_data.get('title', '新闻标题')
        summary = news_data.get('summary', '')
        news_type = news_data.get('news_type', '综合')
        
        if full_content:
            core_content = full_content
        elif summary:
            core_content = summary
        else:
            core_content = f'关于{title}的相关报道。'
        
        emojis = EMOJIS.get(platform_type, EMOJIS['微信公众号'])
        emoji1 = random.choice(emojis)
        emoji2 = random.choice([e for e in emojis if e != emoji1])
        emoji3 = random.choice([e for e in emojis if e not in [emoji1, emoji2]])
        
        if platform_type == '小红书':
            return SmartContentGenerator._generate_xiaohongshu(title, core_content, news_type, emoji1, emoji2, emoji3)
        elif platform_type == '抖音文案':
            return SmartContentGenerator._generate_douyin(title, core_content, news_type, emoji1, emoji2, emoji3)
        elif platform_type == '微博':
            return SmartContentGenerator._generate_weibo(title, core_content, news_type, emoji1, emoji2, emoji3)
        elif platform_type == '今日头条':
            return SmartContentGenerator._generate_toutiao(title, core_content, news_type, emoji1, emoji2, emoji3)
        else:
            return SmartContentGenerator._generate_wechat(title, core_content, news_type, emoji1, emoji2, emoji3)
    
    @staticmethod
    def _generate_wechat(title, content, news_type, emoji1, emoji2, emoji3):
        intro_options = [
            f'大家好，今天{emoji1}来和大家聊聊一个{news_type}领域的重要话题：{title}。',
            f'{emoji1} 在当今快速发展的社会中，{news_type}新闻一直是我们关注的焦点。',
            f'{emoji1} 最近，关于"{title}"的新闻引起了社会各界的广泛关注。',
            f'{emoji1} 作为{news_type}领域的观察者，我今天想和大家深入探讨一下这个话题。',
        ]
        
        analysis_options = [
            f'{emoji2} **深度分析**\n\n从多个角度来看，这一事件具有重要的意义。首先，它反映了{news_type}领域的最新动态和发展趋势。其次，它可能会对相关行业产生深远的影响。最后，它也为我们提供了一个思考和学习的机会。\n\n',
            f'{emoji2} **事件解读**\n\n这一事件的发生并非偶然。从宏观层面来看，它是{news_type}领域长期发展的必然结果。从微观层面来看，它又是多种因素共同作用的结果。让我们从以下几个方面来深入分析：\n\n',
            f'{emoji2} **专业视角**\n\n作为{news_type}领域的从业者，我认为这一事件具有标志性意义。它不仅改变了我们对行业的认知，也为未来的发展指明了方向。以下是我的几点思考：\n\n',
        ]
        
        impact_options = [
            f'{emoji3} **影响与启示**\n\n这一事件对{news_type}行业的影响将是深远的。它可能会推动相关政策的调整，促进市场的整合，甚至改变整个行业的竞争格局。\n\n对于我们普通读者而言，这一事件也带来了重要的启示：\n• 要保持对{news_type}领域的关注\n• 要学会理性分析新闻事件\n• 要不断提升自己的专业素养\n\n',
            f'{emoji3} **未来展望**\n\n展望未来，{news_type}领域将继续保持快速发展的态势。技术的进步、政策的支持、市场的需求，都将为行业的发展注入强大的动力。\n\n我们有理由相信，在不久的将来，{news_type}领域将迎来更加繁荣的发展时期。让我们拭目以待！\n\n',
        ]
        
        conclusion_options = [
            f'总结一下，{title}这一事件为我们提供了一个了解{news_type}领域的窗口。希望本文能够为您带来一些启发和思考。\n\n如果您觉得本文有价值，欢迎点赞、在看、转发，让更多人看到优质内容。\n\n关注我们，获取更多{news_type}领域的深度报道和专业分析。\n\n---\n*本文为信息分享，如有侵权请联系删除*',
            f'以上就是我对"{title}"这一{news_type}新闻的深度解读。希望能够帮助大家更好地理解这一事件。\n\n感谢您的阅读！如果您有任何想法或建议，欢迎在评论区留言交流。\n\n我们下期再见！👋',
        ]
        
        intro = random.choice(intro_options)
        analysis = random.choice(analysis_options)
        impact = random.choice(impact_options)
        conclusion = random.choice(conclusion_options)
        
        content_display = content[:500] if len(content) > 500 else content
        
        return f"""{intro}

{analysis}
📝 **事件详情**
{content_display}

{impact}
{conclusion}"""
    
    @staticmethod
    def _generate_xiaohongshu(title, content, news_type, emoji1, emoji2, emoji3):
        openings = [
            f'{emoji1} 姐妹们！今天必须跟大家分享一个超超超重要的发现！',
            f'{emoji1} 救命！我真的被震惊到了！必须马上告诉你们！',
            f'{emoji1} 谁懂啊！这个消息我憋了好久终于可以说了！',
            f'{emoji1} 亲测！这个{news_type}新闻真的太绝了！',
        ]
        
        highlights = [
            f'{emoji2} ✨ 划重点！',
            f'{emoji2} 💡 我的真实感受：',
            f'{emoji2} 🔥 内容亮点：',
            f'{emoji2} 📌 必须知道的事：',
        ]
        
        reactions = [
            f'{emoji3} 说实话，当我看到这个新闻的时候，第一反应就是："我的天！这也太{random.choice(["震撼", "惊喜", "意外", "贴心", "实用"])}了吧！"',
            f'{emoji3} 讲真的，这个{news_type}新闻真的{random.choice(["戳中我了", "说到我心坎里了", "改变我的认知", "让我大开眼界"])}！',
            f'{emoji3} 不吹不黑，这是我近期看到的{random.choice(["最棒的", "最有价值的", "最实用的", "最走心的"])}内容了！',
        ]
        
        tips = [
            f'💬 姐妹们，你们怎么看这件事呢？评论区聊聊！\n\n❤️ 如果觉得我说的有道理，记得点赞收藏哦～\n\n🌟 关注我，分享更多{news_type}相关的优质内容！',
            f'🙋‍♀️ 互动时间到！你们觉得这个内容怎么样？\n\n👍 点赞=学到了\n💬 评论=有共鸣\n⭐ 收藏=以后看\n\n#{"#".join([news_type, "热门", "生活分享", "今日话题", "好物分享" if news_type in ["时尚", "美食", "旅游"] else "知识分享"])}',
        ]
        
        opening = random.choice(openings)
        highlight = random.choice(highlights)
        reaction = random.choice(reactions)
        tip = random.choice(tips)
        
        content_display = content[:400] if len(content) > 400 else content
        
        return f"""{opening}

✨ **{title}** ✨

{highlight}
{content_display}

{reaction}

📝 小总结：
这个{news_type}新闻真的值得每个人都看看！不管你是{news_type}爱好者还是只是想了解最新动态，都强烈推荐！

{tip}"""
    
    @staticmethod
    def _generate_douyin(title, content, news_type, emoji1, emoji2, emoji3):
        hooks = [
            f'{emoji1} 别划走！这个视频{random.choice(["一定要看完", "能改变你的认知", "太真实了", "看完别哭"])}！',
            f'{emoji1} 今天说个事，{random.choice(["99%的人都不知道", "看完我沉默了", "太狠了", "绝了"])}！',
            f'{emoji1} {random.choice(["看完不哭算我输", "这个真相你必须知道", "太扎心了", "我敢说你不知道"])}！',
        ]
        
        main_points = [
            f'{emoji2} 📌 核心要点：',
            f'{emoji2} 💡 重点来了：',
            f'{emoji2} 🔥 划重点：',
            f'{emoji2} ✨ 精华部分：',
        ]
        
        emotions = [
            f'{emoji3} 说实话，当我了解到这件事的时候，我的心情是{random.choice(["复杂的", "沉重的", "惊喜的", "震撼的"])}。',
            f'{emoji3} 讲真的，这个{news_type}新闻让我{random.choice(["想了很久", "感慨万千", "深受触动", "大开眼界"])}。',
            f'{emoji3} 不瞒你说，看完这个内容，我{random.choice(["沉默了", "失眠了", "想通了很多事", "决定改变了"])}。',
        ]
        
        calls_to_action = [
            f'❤️ 如果你觉得我说的有道理，麻烦点个小红心支持一下！\n\n💬 评论区聊聊你的想法！\n\n⭐ 收藏起来，以后慢慢看！\n\n➕ 关注我，每天分享{news_type}相关的精彩内容！',
            f'🙏 感谢看到这里的你！\n\n如果这个内容对你有帮助：\n👍 点赞 → 让更多人看到\n💬 评论 → 我们一起交流\n⭐ 收藏 → 怕找不到\n➕ 关注 → 每天都有新内容\n\n#{"#".join([news_type, "热门", "生活", "情感", "知识"])}',
        ]
        
        hook = random.choice(hooks)
        main_point = random.choice(main_points)
        emotion = random.choice(emotions)
        cta = random.choice(calls_to_action)
        
        content_display = content[:300] if len(content) > 300 else content
        
        return f"""{hook}

今天要讲的是：**{title}**

{main_point}
{content_display}

{emotion}

💭 一句话总结：
这个{news_type}新闻真的值得每个人花几分钟时间认真看看！

{cta}"""
    
    @staticmethod
    def _generate_weibo(title, content, news_type, emoji1, emoji2, emoji3):
        openings = [
            f'{emoji1} 【{title}】刚刚！这个{news_type}新闻冲上热搜了！',
            f'{emoji1} 热搜第一！{title}！太{random.choice(["震撼", "意外", "暖心", "扎心"])}了！',
            f'{emoji1} 热议中！关于{title}，网友们吵翻了！',
            f'{emoji1} 突发！{title}！全网都在关注！',
        ]
        
        netizen_comments = [
            f'{emoji2} 💬 网友热议：\n\n• "我的天！这也太{random.choice(["离谱", "真实", "暖心", "震撼"])}了吧！"\n• "终于有人说真话了！"\n• "我早就觉得有问题！"\n• "这才是真相吗？"',
            f'{emoji2} 🔥 热评精选：\n\n1️⃣ "看完我{random.choice(["沉默了", "破防了", "惊呆了", "泪目了"])}..."\n2️⃣ "这才是我们应该关注的{news_type}新闻！"\n3️⃣ "转发了！让更多人看到！"\n4️⃣ "说得太对了！完全同意！"',
        ]
        
        personal_opinions = [
            f'{emoji3} 🤔 我的看法：\n\n说实话，看到这个{news_type}新闻的时候，我是{random.choice(["震惊的", "欣慰的", "担忧的", "期待的"])}。\n\n一方面，这说明{random.choice(["社会在进步", "问题被重视", "关注在增加", "改变在发生"])}；\n但另一方面，我们也需要{random.choice(["保持理性", "深入思考", "持续关注", "行动起来"])}。',
        ]
        
        interactions = [
            f'🙋‍♀️ 你们怎么看这件事？\n\n👇 投票：\nA. 太震撼了！\nB. 在意料之中\nC. 还需要更多信息\nD. 不关心\n\n评论区留下你的选择！\n\n#{"#".join([news_type, "热门话题", "社会热点", "热议", "新闻"])}',
            f'💬 互动时间！\n\n看完这个{news_type}新闻，你有什么想说的？\n\n点赞=认同\n转发=让更多人看到\n评论=说出你的想法\n\n#{"#".join([title[:10], news_type, "热搜", "热门", "热议"])}',
        ]
        
        opening = random.choice(openings)
        netizen = random.choice(netizen_comments)
        opinion = random.choice(personal_opinions)
        interaction = random.choice(interactions)
        
        content_display = content[:350] if len(content) > 350 else content
        
        return f"""{opening}

📰 事件详情：
{content_display}

{netizen}

{opinion}

{interaction}"""
    
    @staticmethod
    def _generate_toutiao(title, content, news_type, emoji1, emoji2, emoji3):
        headlines = [
            f'{emoji1} 【深度解析】{title}——{news_type}领域的标志性事件',
            f'{emoji1} 【独家报道】{title}：事件始末与深远影响',
            f'{emoji1} 【专家解读】{title}：对{news_type}行业意味着什么？',
            f'{emoji1} 【重磅分析】{title}：一文看懂来龙去脉',
        ]
        
        event_overviews = [
            f'{emoji2} ## 事件概述\n\n{content[:300] if len(content) > 300 else content}',
            f'{emoji2} ## 事件回顾\n\n据了解，{title}这一事件近期引发了{news_type}领域的广泛关注。以下是事件的详细经过：\n\n{content[:300] if len(content) > 300 else content}',
        ]
        
        backgrounds = [
            f'{emoji3} ## 事件背景\n\n近年来，{news_type}领域一直处于快速发展之中。技术革新、政策调整、市场变化等多种因素交织，使得行业格局持续演变。\n\n此次{title}事件的发生，正是在这样一个大背景下。它不仅是一个独立的新闻事件，更是{news_type}领域发展趋势的一个缩影。',
        ]
        
        impacts = [
            f'## 事件影响分析\n\n### 对{news_type}行业的影响\n\n这一事件可能会在多个层面影响{news_type}行业：\n\n1. **短期影响**：短期内，事件将持续成为舆论焦点，相关话题热度将居高不下。\n\n2. **中期影响**：事件可能引发行业内的反思和讨论，促使相关企业和机构调整策略。\n\n3. **长期影响**：从长远来看，这一事件可能成为{news_type}领域发展的一个转折点，推动行业向更加成熟、规范的方向发展。\n\n### 对公众的影响\n\n对于普通公众而言，这一事件也具有重要意义：\n• 提升了公众对{news_type}领域的关注度\n• 促进了相关知识的普及\n• 引发了公众对相关话题的深入思考',
        ]
        
        expert_views = [
            f'## 专家观点\n\n我们采访了{news_type}领域的多位专家，他们对这一事件发表了各自的看法：\n\n> "这一事件具有标志性意义，它标志着{news_type}领域进入了一个新的发展阶段。" —— 某行业专家\n\n> "我们需要从多个角度来审视这一事件，不能简单地做出判断。" —— 某研究学者\n\n> "这一事件提醒我们，{news_type}领域的发展还面临着诸多挑战。" —— 某业内人士',
        ]
        
        conclusions = [
            f'## 结语\n\n{title}这一{news_type}新闻事件，为我们提供了一个观察行业发展、思考社会问题的窗口。\n\n在信息爆炸的今天，我们每个人都应该：\n• 保持理性，不盲目跟风\n• 多方求证，获取全面信息\n• 独立思考，形成自己的判断\n\n希望本文能够为您理解这一事件提供一些帮助。如果您觉得本文有价值，欢迎点赞、评论、转发。\n\n关注我们，获取更多{news_type}领域的深度报道和专业分析。\n\n---\n*本文为信息分享，观点仅供参考。如有侵权，请联系删除。*',
        ]
        
        headline = random.choice(headlines)
        event_overview = random.choice(event_overviews)
        background = random.choice(backgrounds)
        impact = random.choice(impacts)
        expert_view = random.choice(expert_views)
        conclusion = random.choice(conclusions)
        
        return f"""# {headline}

{event_overview}

{background}

{impact}

{expert_view}

{conclusion}"""


class ImageGenerator:
    FALLBACK_IMAGES = {
        '科技': [
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop',
        ],
        '财经': [
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop',
        ],
        '体育': [
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
        ],
        '娱乐': [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=450&fit=crop',
        ],
        '教育': [
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop',
        ],
        '健康': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
        ],
        '社会': [
            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop',
        ],
        '军事': [
            'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=450&fit=crop',
        ],
        '汽车': [
            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=450&fit=crop',
        ],
        '房产': [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=450&fit=crop',
        ],
        '旅游': [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=450&fit=crop',
        ],
        '美食': [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=450&fit=crop',
        ],
        '时尚': [
            'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=450&fit=crop',
        ],
        '综合': [
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
            'https://images.unsplash.com/photo-1529243856184-fd5465488984?w=800&h=450&fit=crop',
        ]
    }
    
    @staticmethod
    def get_fallback_image(news_type):
        images = ImageGenerator.FALLBACK_IMAGES.get(news_type, ImageGenerator.FALLBACK_IMAGES['综合'])
        return random.choice(images)
    
    @staticmethod
    def generate_image(news_data, platform_type):
        news_type = news_data.get('news_type', '综合')
        title = news_data.get('title', '新闻标题')
        
        style_descriptions = {
            '微信公众号': 'professional article header image, modern minimalist design, clean typography, warm color palette, high quality digital art',
            '小红书': 'lifestyle aesthetic image, soft pastel colors, trendy social media style, cute decorative elements, warm and inviting atmosphere',
            '今日头条': 'breaking news style image, dynamic composition, professional journalism aesthetic, bold design elements, high contrast',
            '微博': 'viral social media image, eye-catching design, trending style, shareable content aesthetic, vibrant colors',
            '抖音文案': 'short video thumbnail style, attention-grabbing design, high energy visuals, modern digital aesthetic, bold colors'
        }
        
        news_type_keywords = {
            '科技': 'technology, innovation, digital, futuristic',
            '财经': 'finance, economy, business, investment',
            '体育': 'sports, athletics, competition, energy',
            '娱乐': 'entertainment, celebrity, lifestyle, glamour',
            '教育': 'education, learning, knowledge, academic',
            '健康': 'health, wellness, medical, lifestyle',
            '社会': 'society, community, social issues, people',
            '军事': 'military, defense, security, strategy',
            '汽车': 'automobile, transportation, vehicles, technology',
            '房产': 'real estate, property, housing, architecture',
            '旅游': 'travel, tourism, adventure, exploration',
            '美食': 'food, cuisine, dining, culinary',
            '时尚': 'fashion, style, trends, beauty',
            '综合': 'general news, information, media, communication'
        }
        
        keywords = news_type_keywords.get(news_type, news_type_keywords['综合'])
        style = style_descriptions.get(platform_type, style_descriptions['微信公众号'])
        
        prompt = f"{style}, {keywords}, news article about '{title[:30]}...', high quality, professional photography"
        
        try:
            encoded_prompt = requests.utils.quote(prompt)
            image_url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={encoded_prompt}&image_size=landscape_16_9"
            
            try:
                test_response = requests.head(image_url, timeout=5, allow_redirects=True)
                if test_response.status_code == 200:
                    content_type = test_response.headers.get('Content-Type', '')
                    if 'image' in content_type.lower():
                        return {
                            'image_url': image_url,
                            'prompt': prompt,
                            'platform': platform_type,
                            'source': 'ai-generated'
                        }
            except:
                pass
            
            fallback_url = ImageGenerator.get_fallback_image(news_type)
            return {
                'image_url': fallback_url,
                'prompt': prompt,
                'platform': platform_type,
                'source': 'fallback',
                'news_type': news_type
            }
            
        except Exception as e:
            print(f"Image generation error: {e}")
            fallback_url = ImageGenerator.get_fallback_image(news_type)
            return {
                'image_url': fallback_url,
                'prompt': prompt,
                'platform': platform_type,
                'source': 'fallback-error',
                'news_type': news_type
            }


@app.route('/')
def index():
    return render_template('index.html', 
                         news_types=NEWS_TYPES,
                         platform_types=PLATFORM_TYPES)


@app.route('/api/extract', methods=['POST'])
def extract_news():
    data = request.get_json()
    url = data.get('url', '')
    news_type = data.get('news_type', '综合')
    limit = data.get('limit', 10)
    
    if not url:
        return jsonify({'error': '请输入新闻网页URL'}), 400
    
    news_list = NewsExtractor.extract_news_from_page(url, news_type, limit)
    
    if not news_list:
        return jsonify({
            'success': False,
            'error': '未能从该URL提取到新闻，请尝试其他新闻网站'
        }), 404
    
    return jsonify({
        'success': True,
        'data': news_list,
        'count': len(news_list)
    })


@app.route('/api/generate/article', methods=['POST'])
def generate_article():
    data = request.get_json()
    news_data = data.get('news_data', {})
    platform_type = data.get('platform_type', '微信公众号')
    
    if not news_data:
        return jsonify({'error': '请选择新闻'}), 400
    
    full_content = ''
    news_url = news_data.get('url', '')
    if news_url and news_url.startswith('http'):
        full_content = NewsExtractor.fetch_article_detail(news_url)
    
    new_title = SmartContentGenerator.rewrite_title(
        news_data.get('title', ''), 
        platform_type, 
        news_data.get('news_type', '综合')
    )
    content = SmartContentGenerator.generate_article_content(news_data, platform_type, full_content)
    
    return jsonify({
        'success': True,
        'data': {
            'title': new_title,
            'content': content,
            'platform': platform_type,
            'original_title': news_data.get('title', '')
        }
    })


@app.route('/api/generate/image', methods=['POST'])
def generate_image():
    data = request.get_json()
    news_data = data.get('news_data', {})
    platform_type = data.get('platform_type', '微信公众号')
    
    if not news_data:
        return jsonify({'error': '请选择新闻'}), 400
    
    image = ImageGenerator.generate_image(news_data, platform_type)
    
    return jsonify({
        'success': True,
        'data': image
    })


@app.route('/api/generate/full', methods=['POST'])
def generate_full():
    data = request.get_json()
    news_data = data.get('news_data', {})
    platform_type = data.get('platform_type', '微信公众号')
    
    if not news_data:
        return jsonify({'error': '请选择新闻'}), 400
    
    full_content = ''
    news_url = news_data.get('url', '')
    if news_url and news_url.startswith('http'):
        full_content = NewsExtractor.fetch_article_detail(news_url)
    
    new_title = SmartContentGenerator.rewrite_title(
        news_data.get('title', ''), 
        platform_type, 
        news_data.get('news_type', '综合')
    )
    content = SmartContentGenerator.generate_article_content(news_data, platform_type, full_content)
    
    image = ImageGenerator.generate_image(news_data, platform_type)
    
    return jsonify({
        'success': True,
        'data': {
            'article': {
                'title': new_title,
                'content': content,
                'platform': platform_type,
                'original_title': news_data.get('title', '')
            },
            'image': image
        }
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
