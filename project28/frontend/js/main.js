(function() {
    const startTime = performance.now();
    
    window.onload = function() {
        const loadTime = performance.now() - startTime;
        console.log('页面加载时间:', loadTime.toFixed(2) + 'ms');
        
        if (loadTime < 2000) {
            console.log('✓ 页面加载符合要求 (<2秒)');
        } else {
            console.warn('✗ 页面加载时间超过2秒');
        }
        
        initMetrics();
        initChinaMap();
    };
})();
