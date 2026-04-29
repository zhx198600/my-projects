@echo off
echo ========================================
echo   智能新闻内容生成系统
echo ========================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo 正在检查依赖项...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [提示] 正在安装依赖项...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

echo.
echo 正在启动服务器...
echo.
echo ========================================
echo   系统启动成功！
echo   请在浏览器中访问: http://localhost:5000
echo ========================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

python app.py
