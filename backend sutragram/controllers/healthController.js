import mongoose from 'mongoose';

// @desc    Health check
// @route   GET /api/health
// @access  Public
export const healthCheck = async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        };

        // Check database connection
        if (mongoose.connection.readyState === 1) {
            health.database = 'connected';
        } else {
            health.database = 'disconnected';
            health.status = 'unhealthy';
        }

        // Check memory usage
        const memoryUsage = process.memoryUsage();
        health.memory = {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        };

        const statusCode = health.status === 'healthy' ? 200 : 503;

        res.status(statusCode).json({
            success: health.status === 'healthy',
            data: health,
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            success: false,
            message: 'Health check failed.',
            error: error.message,
        });
    }
};

// @desc    Readiness check (for Kubernetes/Docker)
// @route   GET /api/ready
// @access  Public
export const readinessCheck = async (req, res) => {
    try {
        // Check if app is ready to receive traffic
        const isReady = mongoose.connection.readyState === 1;

        if (isReady) {
            res.status(200).json({
                success: true,
                message: 'Service is ready',
            });
        } else {
            res.status(503).json({
                success: false,
                message: 'Service is not ready',
            });
        }
    } catch (error) {
        console.error('Readiness check error:', error);
        res.status(503).json({
            success: false,
            message: 'Readiness check failed.',
            error: error.message,
        });
    }
};

// @desc    Liveness check (for Kubernetes/Docker)
// @route   GET /api/live
// @access  Public
export const livenessCheck = async (req, res) => {
    // Simple check to see if the app is alive
    res.status(200).json({
        success: true,
        message: 'Service is alive',
        timestamp: new Date().toISOString(),
    });
};
