import random
import math
from typing import List, Dict, Any, Optional
from datetime import datetime


PROVINCES_DATA = [
    {"name": "北京市", "code": "110000", "region": "华北", "coastal": False, "tier": 1},
    {"name": "天津市", "code": "120000", "region": "华北", "coastal": True, "tier": 1},
    {"name": "河北省", "code": "130000", "region": "华北", "coastal": True, "tier": 2},
    {"name": "山西省", "code": "140000", "region": "华北", "coastal": False, "tier": 3},
    {"name": "内蒙古自治区", "code": "150000", "region": "华北", "coastal": False, "tier": 3},
    {"name": "辽宁省", "code": "210000", "region": "东北", "coastal": True, "tier": 2},
    {"name": "吉林省", "code": "220000", "region": "东北", "coastal": False, "tier": 3},
    {"name": "黑龙江省", "code": "230000", "region": "东北", "coastal": False, "tier": 3},
    {"name": "上海市", "code": "310000", "region": "华东", "coastal": True, "tier": 1},
    {"name": "江苏省", "code": "320000", "region": "华东", "coastal": True, "tier": 1},
    {"name": "浙江省", "code": "330000", "region": "华东", "coastal": True, "tier": 1},
    {"name": "安徽省", "code": "340000", "region": "华东", "coastal": False, "tier": 2},
    {"name": "福建省", "code": "350000", "region": "华东", "coastal": True, "tier": 2},
    {"name": "江西省", "code": "360000", "region": "华东", "coastal": False, "tier": 3},
    {"name": "山东省", "code": "370000", "region": "华东", "coastal": True, "tier": 1},
    {"name": "河南省", "code": "410000", "region": "华中", "coastal": False, "tier": 2},
    {"name": "湖北省", "code": "420000", "region": "华中", "coastal": False, "tier": 2},
    {"name": "湖南省", "code": "430000", "region": "华中", "coastal": False, "tier": 2},
    {"name": "广东省", "code": "440000", "region": "华南", "coastal": True, "tier": 1},
    {"name": "广西壮族自治区", "code": "450000", "region": "华南", "coastal": True, "tier": 3},
    {"name": "海南省", "code": "460000", "region": "华南", "coastal": True, "tier": 2},
    {"name": "重庆市", "code": "500000", "region": "西南", "coastal": False, "tier": 2},
    {"name": "四川省", "code": "510000", "region": "西南", "coastal": False, "tier": 2},
    {"name": "贵州省", "code": "520000", "region": "西南", "coastal": False, "tier": 3},
    {"name": "云南省", "code": "530000", "region": "西南", "coastal": False, "tier": 3},
    {"name": "西藏自治区", "code": "540000", "region": "西南", "coastal": False, "tier": 4},
    {"name": "陕西省", "code": "610000", "region": "西北", "coastal": False, "tier": 2},
    {"name": "甘肃省", "code": "620000", "region": "西北", "coastal": False, "tier": 3},
    {"name": "青海省", "code": "630000", "region": "西北", "coastal": False, "tier": 4},
    {"name": "宁夏回族自治区", "code": "640000", "region": "西北", "coastal": False, "tier": 3},
    {"name": "新疆维吾尔自治区", "code": "650000", "region": "西北", "coastal": False, "tier": 4},
    {"name": "台湾省", "code": "710000", "region": "华东", "coastal": True, "tier": 1},
    {"name": "香港特别行政区", "code": "810000", "region": "华南", "coastal": True, "tier": 1},
    {"name": "澳门特别行政区", "code": "820000", "region": "华南", "coastal": True, "tier": 2},
]


CITY_DATA = {
    "110000": [
        {"name": "朝阳区", "code": "110105", "weight": 1.5},
        {"name": "海淀区", "code": "110108", "weight": 1.6},
        {"name": "东城区", "code": "110101", "weight": 1.2},
        {"name": "西城区", "code": "110102", "weight": 1.3},
        {"name": "丰台区", "code": "110106", "weight": 1.0},
        {"name": "通州区", "code": "110112", "weight": 0.9},
        {"name": "大兴区", "code": "110115", "weight": 0.85},
        {"name": "昌平区", "code": "110114", "weight": 0.9},
    ],
    "440000": [
        {"name": "广州市", "code": "440100", "weight": 1.5},
        {"name": "深圳市", "code": "440300", "weight": 1.8},
        {"name": "东莞市", "code": "441900", "weight": 1.3},
        {"name": "佛山市", "code": "440600", "weight": 1.2},
        {"name": "惠州市", "code": "441300", "weight": 0.9},
        {"name": "中山市", "code": "442000", "weight": 1.0},
        {"name": "珠海市", "code": "440400", "weight": 1.1},
        {"name": "汕头市", "code": "440500", "weight": 0.85},
    ],
    "310000": [
        {"name": "浦东新区", "code": "310115", "weight": 1.7},
        {"name": "黄浦区", "code": "310101", "weight": 1.4},
        {"name": "静安区", "code": "310106", "weight": 1.3},
        {"name": "徐汇区", "code": "310104", "weight": 1.25},
        {"name": "长宁区", "code": "310105", "weight": 1.1},
        {"name": "普陀区", "code": "310107", "weight": 1.0},
        {"name": "杨浦区", "code": "310110", "weight": 0.95},
        {"name": "松江区", "code": "310117", "weight": 0.85},
    ],
    "330000": [
        {"name": "杭州市", "code": "330100", "weight": 1.6},
        {"name": "宁波市", "code": "330200", "weight": 1.4},
        {"name": "温州市", "code": "330300", "weight": 1.2},
        {"name": "金华市", "code": "330700", "weight": 1.0},
        {"name": "嘉兴市", "code": "330400", "weight": 0.95},
        {"name": "绍兴市", "code": "330600", "weight": 0.9},
        {"name": "台州市", "code": "331000", "weight": 0.85},
    ],
    "320000": [
        {"name": "南京市", "code": "320100", "weight": 1.5},
        {"name": "苏州市", "code": "320500", "weight": 1.7},
        {"name": "无锡市", "code": "320200", "weight": 1.3},
        {"name": "常州市", "code": "320400", "weight": 1.1},
        {"name": "南通市", "code": "320600", "weight": 1.0},
        {"name": "徐州市", "code": "320300", "weight": 0.9},
        {"name": "盐城市", "code": "320900", "weight": 0.8},
    ],
}


BASE_METRICS = {
    "total_transaction": {"min": 5000, "max": 50000, "unit": "万元"},
    "order_count": {"min": 10000, "max": 500000, "unit": "单"},
    "avg_order_value": {"min": 80, "max": 500, "unit": "元"},
    "online_users": {"min": 1000, "max": 50000, "unit": "人"},
}


class DataGenerator:
    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
        self._last_province_data = {}
        self._initialize_base_values()

    def _initialize_base_values(self):
        for province in PROVINCES_DATA:
            base_weight = self._calculate_region_weight(province)
            self._last_province_data[province["code"]] = {
                "total_transaction": BASE_METRICS["total_transaction"]["min"] * base_weight,
                "order_count": BASE_METRICS["order_count"]["min"] * base_weight,
                "avg_order_value": BASE_METRICS["avg_order_value"]["min"] + (base_weight - 1) * 50,
                "online_users": BASE_METRICS["online_users"]["min"] * base_weight,
            }

    def _calculate_region_weight(self, province: Dict[str, Any]) -> float:
        weight = 1.0
        tier_weights = {1: 3.0, 2: 2.0, 3: 1.2, 4: 0.6}
        weight *= tier_weights.get(province["tier"], 1.0)
        if province["coastal"]:
            weight *= 1.4
        return weight

    def _fluctuate(self, value: float, range_percent: float = 0.05) -> float:
        fluctuation = random.uniform(-range_percent, range_percent)
        return value * (1 + fluctuation)

    def generate_province_data(self, province_code: Optional[str] = None) -> Dict[str, Any]:
        if province_code:
            provinces = [p for p in PROVINCES_DATA if p["code"] == province_code]
            if not provinces:
                raise ValueError(f"Province code {province_code} not found")
            province = provinces[0]
            return self._generate_single_province(province)
        
        result = []
        for province in PROVINCES_DATA:
            result.append(self._generate_single_province(province))
        return {
            "timestamp": datetime.now().isoformat(),
            "total_count": len(result),
            "data": result
        }

    def _generate_single_province(self, province: Dict[str, Any]) -> Dict[str, Any]:
        last_data = self._last_province_data[province["code"]]
        
        new_data = {
            "name": province["name"],
            "code": province["code"],
            "region": province["region"],
            "is_coastal": province["coastal"],
            "total_transaction": round(self._fluctuate(last_data["total_transaction"]), 2),
            "order_count": int(self._fluctuate(last_data["order_count"])),
            "avg_order_value": round(self._fluctuate(last_data["avg_order_value"]), 2),
            "online_users": int(self._fluctuate(last_data["online_users"])),
        }
        
        new_data["transaction_per_user"] = round(
            new_data["total_transaction"] * 10000 / new_data["online_users"] 
            if new_data["online_users"] > 0 else 0, 2
        )
        
        self._last_province_data[province["code"]] = {
            "total_transaction": new_data["total_transaction"],
            "order_count": new_data["order_count"],
            "avg_order_value": new_data["avg_order_value"],
            "online_users": new_data["online_users"],
        }
        
        return new_data

    def generate_city_data(self, province_code: str) -> Dict[str, Any]:
        if province_code not in CITY_DATA:
            raise ValueError(f"City data for province code {province_code} not available")
        
        province_info = next(p for p in PROVINCES_DATA if p["code"] == province_code)
        province_base_data = self._generate_single_province(province_info)
        
        cities = CITY_DATA[province_code]
        total_weight = sum(c["weight"] for c in cities)
        
        city_data = []
        for city in cities:
            weight_ratio = city["weight"] / total_weight
            city_data.append({
                "name": city["name"],
                "code": city["code"],
                "total_transaction": round(province_base_data["total_transaction"] * weight_ratio, 2),
                "order_count": int(province_base_data["order_count"] * weight_ratio),
                "avg_order_value": round(self._fluctuate(province_base_data["avg_order_value"]), 2),
                "online_users": int(province_base_data["online_users"] * weight_ratio),
                "weight": city["weight"],
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "province_name": province_info["name"],
            "province_code": province_code,
            "total_cities": len(city_data),
            "province_summary": province_base_data,
            "data": city_data
        }

    def verify_data(self) -> Dict[str, Any]:
        test_rounds = 10
        all_province_data = []
        fluctuation_records = {p["code"]: [] for p in PROVINCES_DATA}
        
        for _ in range(test_rounds):
            result = self.generate_province_data()
            all_province_data.append(result["data"])
        
        for province in PROVINCES_DATA:
            code = province["code"]
            values = []
            for round_data in all_province_data:
                province_data = next(d for d in round_data if d["code"] == code)
                values.append(province_data["total_transaction"])
            
            max_fluctuation = 0
            for i in range(1, len(values)):
                if values[i-1] > 0:
                    fluct = abs((values[i] - values[i-1]) / values[i-1])
                    max_fluctuation = max(max_fluctuation, fluct)
            fluctuation_records[code] = {
                "max_fluctuation": round(max_fluctuation * 100, 2),
                "fluctuation_pass": max_fluctuation <= 0.05
            }
        
        latest_data = all_province_data[-1]
        coastal_avg = sum(
            d["total_transaction"] for d in latest_data if d["is_coastal"]
        ) / len([d for d in latest_data if d["is_coastal"]])
        inland_avg = sum(
            d["total_transaction"] for d in latest_data if not d["is_coastal"]
        ) / len([d for d in latest_data if not d["is_coastal"]])
        
        all_pass = all(
            record["fluctuation_pass"] for record in fluctuation_records.values()
        )
        region_distribution_pass = coastal_avg > inland_avg * 1.2
        
        tier1_avg = sum(
            d["total_transaction"] for d in latest_data 
            if next(p["tier"] for p in PROVINCES_DATA if p["code"] == d["code"]) == 1
        ) / len([d for d in latest_data if next(p["tier"] for p in PROVINCES_DATA if p["code"] == d["code"]) == 1])
        
        tier4_avg = sum(
            d["total_transaction"] for d in latest_data 
            if next(p["tier"] for p in PROVINCES_DATA if p["code"] == d["code"]) == 4
        ) / len([d for d in latest_data if next(p["tier"] for p in PROVINCES_DATA if p["code"] == d["code"]) == 4])
        
        return {
            "verification_time": datetime.now().isoformat(),
            "province_count": len(PROVINCES_DATA),
            "province_count_pass": len(PROVINCES_DATA) == 34,
            "fluctuation_verification": {
                "test_rounds": test_rounds,
                "allowed_range": "±5%",
                "all_provinces_pass": all_pass,
                "details": fluctuation_records
            },
            "region_distribution": {
                "coastal_provinces_avg": round(coastal_avg, 2),
                "inland_provinces_avg": round(inland_avg, 2),
                "coastal_vs_inland_ratio": round(coastal_avg / inland_avg, 2),
                "region_distribution_pass": region_distribution_pass,
                "tier1_vs_tier4_ratio": round(tier1_avg / tier4_avg, 2)
            },
            "top_10_provinces": sorted(
                latest_data, 
                key=lambda x: x["total_transaction"], 
                reverse=True
            )[:10],
            "overall_pass": len(PROVINCES_DATA) == 34 and all_pass and region_distribution_pass
        }


_generator_instance = DataGenerator()


def get_overview_data() -> Dict[str, Any]:
    province_data = _generator_instance.generate_province_data()["data"]
    totalGMV = sum(p["total_transaction"] for p in province_data) * 10000
    totalOrders = sum(p["order_count"] for p in province_data)
    totalOnlineUsers = sum(p["online_users"] for p in province_data)
    avgPrice = totalGMV / totalOrders if totalOrders > 0 else 0
    
    return {
        "totalGMV": round(totalGMV, 2),
        "totalOrders": totalOrders,
        "avgPrice": round(avgPrice, 2),
        "onlineUsers": totalOnlineUsers,
        "timestamp": datetime.now().isoformat()
    }


def get_national_region_data() -> List[Dict[str, Any]]:
    province_data = _generator_instance.generate_province_data()["data"]
    return [
        {
            "name": p["name"],
            "code": p["code"],
            "region": p["region"],
            "gmv": round(p["total_transaction"] * 10000, 2),
            "orders": p["order_count"],
            "avgPrice": p["avg_order_value"],
            "onlineUsers": p["online_users"]
        }
        for p in province_data
    ]


def get_province_city_data(province_code: str) -> Dict[str, Any]:
    city_result = _generator_instance.generate_city_data(province_code)
    return [
        {
            "name": c["name"],
            "code": c["code"],
            "gmv": round(c["total_transaction"] * 10000, 2),
            "orders": c["order_count"],
            "avgPrice": c["avg_order_value"],
            "onlineUsers": c["online_users"]
        }
        for c in city_result["data"]
    ]


def get_top10_ranking() -> List[Dict[str, Any]]:
    province_data = _generator_instance.generate_province_data()["data"]
    sorted_provinces = sorted(province_data, key=lambda x: x["total_transaction"], reverse=True)[:10]
    return [
        {
            "rank": i + 1,
            "name": p["name"],
            "code": p["code"],
            "gmv": round(p["total_transaction"] * 10000, 2),
            "orders": p["order_count"]
        }
        for i, p in enumerate(sorted_provinces)
    ]


def get_province_data(province_code: Optional[str] = None) -> Dict[str, Any]:
    return _generator_instance.generate_province_data(province_code)


def get_city_data(province_code: str) -> Dict[str, Any]:
    return _generator_instance.generate_city_data(province_code)


def run_verification() -> Dict[str, Any]:
    return _generator_instance.verify_data()


def get_available_provinces() -> List[Dict[str, str]]:
    return [{"name": p["name"], "code": p["code"]} for p in PROVINCES_DATA]


def get_available_cities() -> Dict[str, List[Dict[str, str]]]:
    result = {}
    for province_code, cities in CITY_DATA.items():
        province_name = next(p["name"] for p in PROVINCES_DATA if p["code"] == province_code)
        result[province_name] = [{"name": c["name"], "code": c["code"]} for c in cities]
    return result


if __name__ == "__main__":
    print("=" * 60)
    print("交易数据模拟生成器 - 验证测试")
    print("=" * 60)
    
    print("\n1. 验证34个省级行政区数据...")
    data = get_province_data()
    print(f"   生成省份数量: {data['total_count']} / 34")
    print(f"   状态: {'通过' if data['total_count'] == 34 else '失败'}")
    
    print("\n2. 运行数据波动和区域分布验证...")
    verify_result = run_verification()
    print(f"   数据波动验证: {'全部通过' if verify_result['fluctuation_verification']['all_provinces_pass'] else '存在异常'}")
    print(f"   区域分布验证: {'通过' if verify_result['region_distribution']['region_distribution_pass'] else '失败'}")
    print(f"   沿海/内地数据比例: {verify_result['region_distribution']['coastal_vs_inland_ratio']}")
    print(f"   一线/四线省份数据比例: {verify_result['region_distribution']['tier1_vs_tier4_ratio']}")
    
    print("\n3. 交易额Top 10省份:")
    for i, province in enumerate(verify_result["top_10_provinces"], 1):
        coastal_mark = "☆" if province["is_coastal"] else " "
        print(f"   {i:2d}. {province['name']:10s} {province['total_transaction']:12,.2f} 万元 {coastal_mark}")
    
    print("\n4. 市级数据生成示例（广东省）:")
    guangdong_data = get_city_data("440000")
    print(f"   生成城市数量: {guangdong_data['total_cities']}")
    for city in guangdong_data["data"]:
        print(f"      - {city['name']}: {city['total_transaction']:,.2f} 万元")
    
    print("\n" + "=" * 60)
    print(f"总体验证结果: {'✅ 全部通过' if verify_result['overall_pass'] else '❌ 存在问题'}")
    print("=" * 60)
