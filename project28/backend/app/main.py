from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Any, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_generator import (
    get_province_data,
    get_city_data,
    run_verification,
    get_available_provinces,
    get_available_cities,
    get_overview_data,
    get_national_region_data,
    get_province_city_data,
    get_top10_ranking
)


def success_response(data: Any) -> Dict[str, Any]:
    return {
        "code": 200,
        "message": "success",
        "data": data
    }

app = FastAPI(
    title="交易数据模拟生成器 API",
    description="全国34个省级行政区交易数据模拟生成API服务，支持市级数据生成和验证功能",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello FastAPI!", "status": "success"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Transaction Data Generator API"}


@app.get("/api/provinces", summary="获取所有省级行政区交易数据")
async def api_get_province_data():
    return get_province_data()


@app.get("/api/provinces/{province_code}", summary="获取单个省级行政区交易数据")
async def api_get_single_province(province_code: str):
    try:
        return get_province_data(province_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/provinces/{province_code}/cities", summary="获取某省份市级交易数据")
async def api_get_city_data(province_code: str):
    try:
        return get_city_data(province_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/meta/provinces", summary="获取可用省份列表")
async def api_get_available_provinces():
    return get_available_provinces()


@app.get("/api/meta/cities", summary="获取可用城市列表")
async def api_get_available_cities():
    return get_available_cities()


@app.get("/api/verify", summary="运行数据验证")
async def api_verify():
    return run_verification()


@app.get("/api/overview", summary="获取核心总览数据")
async def api_get_overview():
    data = get_overview_data()
    return success_response(data)


@app.get("/api/region/national/china", summary="获取全国各省区域交易数据")
async def api_get_national_region():
    data = get_national_region_data()
    return success_response(data)


@app.get("/api/region/province/{code}", summary="获取指定省份市级数据")
async def api_get_province_region(code: str):
    try:
        data = get_province_city_data(code)
        return success_response(data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/ranking", summary="获取TOP10省份交易额排名")
async def api_get_ranking():
    data = get_top10_ranking()
    return success_response(data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
