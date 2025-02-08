// Theme configuration for all charts
Chart.defaults.color = '#ffffff';
Chart.defaults.borderColor = '#333333';

// Configuration
const GA4_PROPERTY_ID = 'properties/477002935'; // Replace with your GA4 property ID
const CLIENT_ID = 'G-XDD3G4WHKS'; // From Google Cloud Console

// Initialize the Analytics API
async function initializeAnalytics() {
    try {
        await gapi.client.init({
            clientId: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/analytics.readonly'
        });
        
        await gapi.client.load('analyticsdata', 'v1beta');
        updateDashboard();
    } catch (error) {
        console.error('Error initializing analytics:', error);
    }
}

// Fetch visitor data for the past 7 days
async function getVisitorData() {
    try {
        const response = await gapi.client.analyticsdata.properties.runReport({
            property: GA4_PROPERTY_ID,
            resource: {
                dateRanges: [{
                    startDate: '7daysAgo',
                    endDate: 'today'
                }],
                metrics: [{
                    name: 'activeUsers'
                }],
                dimensions: [{
                    name: 'date'
                }]
            }
        });

        return {
            labels: response.result.rows.map(row => row.dimensionValues[0].value),
            data: response.result.rows.map(row => parseInt(row.metricValues[0].value))
        };
    } catch (error) {
        console.error('Error fetching visitor data:', error);
        return null;
    }
}

// Fetch traffic source data
async function getTrafficSourceData() {
    try {
        const response = await gapi.client.analyticsdata.properties.runReport({
            property: GA4_PROPERTY_ID,
            resource: {
                dateRanges: [{
                    startDate: '30daysAgo',
                    endDate: 'today'
                }],
                metrics: [{
                    name: 'sessions'
                }],
                dimensions: [{
                    name: 'sessionSource'
                }]
            }
        });

        return {
            labels: response.result.rows.map(row => row.dimensionValues[0].value),
            data: response.result.rows.map(row => parseInt(row.metricValues[0].value))
        };
    } catch (error) {
        console.error('Error fetching traffic source data:', error);
        return null;
    }
}

// Fetch device data
async function getDeviceData() {
    try {
        const response = await gapi.client.analyticsdata.properties.runReport({
            property: GA4_PROPERTY_ID,
            resource: {
                dateRanges: [{
                    startDate: '30daysAgo',
                    endDate: 'today'
                }],
                metrics: [{
                    name: 'sessions'
                }],
                dimensions: [{
                    name: 'deviceCategory'
                }]
            }
        });

        return {
            labels: response.result.rows.map(row => row.dimensionValues[0].value),
            data: response.result.rows.map(row => parseInt(row.metricValues[0].value))
        };
    } catch (error) {
        console.error('Error fetching device data:', error);
        return null;
    }
}

// Fetch page view data
async function getPageViewData() {
    try {
        const response = await gapi.client.analyticsdata.properties.runReport({
            property: GA4_PROPERTY_ID,
            resource: {
                dateRanges: [{
                    startDate: '30daysAgo',
                    endDate: 'today'
                }],
                metrics: [{
                    name: 'screenPageViews'
                }],
                dimensions: [{
                    name: 'pagePath'
                }],
                orderBys: [{
                    metric: {
                        metricName: 'screenPageViews'
                    },
                    desc: true
                }],
                limit: 5
            }
        });

        return {
            labels: response.result.rows.map(row => row.dimensionValues[0].value),
            data: response.result.rows.map(row => parseInt(row.metricValues[0].value))
        };
    } catch (error) {
        console.error('Error fetching page view data:', error);
        return null;
    }
}

// Get real-time active users
async function getRealTimeUsers() {
    try {
        const response = await gapi.client.analyticsdata.properties.runRealtimeReport({
            property: GA4_PROPERTY_ID,
            resource: {
                metrics: [{
                    name: 'activeUsers'
                }]
            }
        });

        return parseInt(response.result.rows[0].metricValues[0].value);
    } catch (error) {
        console.error('Error fetching real-time users:', error);
        return 0;
    }
}

// Update all charts with real data
async function updateDashboard() {
    // Update visitor trends
    const visitorData = await getVisitorData();
    if (visitorData) {
        visitorsChart.data.labels = visitorData.labels;
        visitorsChart.data.datasets[0].data = visitorData.data;
        visitorsChart.update();
    }

    // Update traffic sources
    const sourceData = await getTrafficSourceData();
    if (sourceData) {
        sourcesChart.data.labels = sourceData.labels;
        sourcesChart.data.datasets[0].data = sourceData.data;
        sourcesChart.update();
    }

    // Update device distribution
    const deviceData = await getDeviceData();
    if (deviceData) {
        devicesChart.data.labels = deviceData.labels;
        devicesChart.data.datasets[0].data = deviceData.data;
        devicesChart.update();
    }

    // Update page views
    const pageData = await getPageViewData();
    if (pageData) {
        pagesChart.data.labels = pageData.labels;
        pagesChart.data.datasets[0].data = pageData.data;
        pagesChart.update();
    }

    // Update real-time metrics
    const activeUsers = await getRealTimeUsers();
    document.getElementById('active-users').textContent = activeUsers;
}

// Initialize charts with empty data
const chartConfig = {
    visitors: {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Visitors',
                data: [],
                borderColor: '#1aaadf',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(26, 170, 223, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    },
    sources: {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#1aaadf',
                    '#ff6b6b',
                    '#4ecdc4',
                    '#45b7d1'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    },
    devices: {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#1aaadf',
                    '#ff6b6b',
                    '#4ecdc4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    },
    pages: {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Page Views',
                data: [],
                backgroundColor: '#1aaadf'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    }
};

// Initialize all charts
const visitorsChart = new Chart(document.getElementById('visitors-chart'), chartConfig.visitors);
const sourcesChart = new Chart(document.getElementById('sources-chart'), chartConfig.sources);
const devicesChart = new Chart(document.getElementById('devices-chart'), chartConfig.devices);
const pagesChart = new Chart(document.getElementById('pages-chart'), chartConfig.pages);

// Start the application
gapi.load('client', initializeAnalytics);

// Update dashboard every 5 minutes
setInterval(updateDashboard, 300000); 