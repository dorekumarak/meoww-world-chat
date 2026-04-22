// Performance monitoring for ultra-fast chat app
import React from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  messageCount: number;
  memoryUsage: number;
  networkLatency: number;
  errorCount: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number = 0;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      messageCount: 0,
      memoryUsage: 0,
      networkLatency: 0,
      errorCount: 0
    };
    this.initializeObservers();
  }

  private initializeObservers() {
    if ('PerformanceObserver' in window) {
      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.metrics.loadTime = entry.duration;
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Monitor paint timing for render performance
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            this.metrics.renderTime = entry.duration || 0;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }
  }

  // Start measuring
  startMeasure() {
    this.startTime = performance.now();
  }

  // End measuring and log metrics
  endMeasure(operation: string) {
    const duration = performance.now() - this.startTime;
    console.log(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
    
    // Update metrics
    switch (operation) {
      case 'messageLoad':
        this.metrics.messageCount++;
        break;
      case 'networkRequest':
        this.metrics.networkLatency = Math.max(this.metrics.networkLatency, duration);
        break;
      case 'error':
        this.metrics.errorCount++;
        break;
    }
  }

  // Get current memory usage
  getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Log performance report
  logPerformanceReport() {
    const metrics = this.getMetrics();
    console.group('🚀 Chat App Performance Report');
    console.log('⚡ Load Time:', `${metrics.loadTime.toFixed(2)}ms`);
    console.log('🎨 Render Time:', `${metrics.renderTime.toFixed(2)}ms`);
    console.log('💾 Memory Usage:', `${metrics.memoryUsage.toFixed(2)}MB`);
    console.log('📡 Network Latency:', `${metrics.networkLatency.toFixed(2)}ms`);
    console.log('📊 Message Count:', metrics.messageCount);
    console.log('❌ Error Count:', metrics.errorCount);
    
    // Performance score
    const score = this.calculatePerformanceScore(metrics);
    console.log(`🏆 Overall Performance Score: ${score}/100`);
    console.groupEnd();
  }

  // Calculate performance score
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;
    
    // Deduct points for slow operations
    if (metrics.loadTime > 1000) score -= 20;
    if (metrics.renderTime > 16) score -= 15;
    if (metrics.memoryUsage > 50) score -= 15;
    if (metrics.networkLatency > 500) score -= 20;
    if (metrics.errorCount > 0) score -= metrics.errorCount * 5;
    
    return Math.max(0, score);
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance hooks for React components
export const usePerformanceMeasure = (operation: string) => {
  return () => {
    console.log(`Performance: Starting measurement for ${operation}`);
    performanceMonitor.startMeasure();
    return () => {
      performanceMonitor.endMeasure(operation);
    };
  };
};

// Network performance monitor
export const measureNetworkLatency = async (url: string): Promise<number> => {
  const start = performance.now();
  try {
    await fetch(url, { method: 'HEAD' });
    return performance.now() - start;
  } catch {
    return 0;
  }
};

// Log performance warnings
export const logPerformanceWarning = (message: string, threshold: number, actual: number) => {
  if (actual > threshold) {
    console.warn(`⚠️ Performance Warning: ${message} (${actual.toFixed(2)} > ${threshold})`);
  }
};
