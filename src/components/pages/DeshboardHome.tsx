import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

const pieChartData = [
    { name: 'Interviews Passed', value: 5 },
    { name: 'Interviews Failed', value: 19 },
];

const lineChartData = {
    xAxis: [{ scaleType: 'point', data: ['1', '2', '3', '4', '5', '6'] }],
    series: [{ label: 'Score', data: [3.2, 5.6, 9.1, 7.4, 6.3, 8.5] }],
};

const DashboardHome = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(4, 200px)',
                    gap: 2,
                    p: 2,
                }}
            >
                {/* Top row cards */}
                <Card sx={{ gridColumn: '1', gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="div">
                            24
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Interviews Taken
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ gridColumn: '2', gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="div">
                            5
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Interviews Passed
                        </Typography>
                    </CardContent>
                </Card>

                {/* Card 3 with MUI Pie Chart */}
                <Card sx={{ gridColumn: '3 / 5', gridRow: '1 / 3' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Interviews Results
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            {pieChartData.map((item) => (
                                <Box key={item.name} sx={{ display: 'flex', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <Typography variant="body2">
                                        {item.name}: {item.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <PieChart
                            series={[{ data: pieChartData }]}
                            width={400}
                            height={300}
                        />
                    </CardContent>
                </Card>

                {/* Second row cards */}
                <Card sx={{ gridColumn: '1', gridRow: '2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="div">
                            19
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Interviews Failed
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ gridColumn: '2', gridRow: '2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="div">
                            6.3
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Average Interview Score
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ gridColumn: '1 / 5', gridRow: '3 / 5' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Interviews score
                        </Typography>
                        <LineChart
                            xAxis={lineChartData.xAxis}
                            series={lineChartData.series}
                            width={800}
                            height={300}
                        />
                    </CardContent>
                </Card>
            </Box>
        </Box>

    );
};

export default DashboardHome;