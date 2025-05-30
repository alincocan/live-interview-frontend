import { 
    Box, 
    Button, 
    Card, 
    CardContent, 
    CardActions,
    Container, 
    Grid, 
    Typography,
    Paper,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

// Define types for payment options
interface BasePaymentOption {
    id: number;
    name: string;
    tokens: number;
    price: number;
    description: string;
    features: string[];
    popular?: boolean;
    bestValue?: boolean;
}

interface SubscriptionPaymentOption extends BasePaymentOption {
    period: 'month' | 'year';
}

const PaymentPage = () => {
    const theme = useTheme();

    // One-time payment options
    const oneTimeOptions: BasePaymentOption[] = [
        { 
            id: 1, 
            name: 'Basic', 
            tokens: 300, 
            price: 9.99, 
            description: 'Perfect for beginners', 
            features: [
                'Approximately 3 interviews or trainings',
                'Email support'
            ]
        },
        { 
            id: 2, 
            name: 'Standard', 
            tokens: 900, 
            price: 24.99, 
            description: 'Most popular choice', 
            popular: true,
            features: [
                'Approximately 9 interviews or trainings',
                'Priority email support'
            ]
        },
        { 
            id: 3, 
            name: 'Premium', 
            tokens: 1500, 
            price: 39.99, 
            description: 'Best value for money', 
            bestValue: true,
            features: [
                'Priority email & chat support',
                'Early access on new features'
            ]
        }
    ];

    // Subscription options
    const subscriptionOptions: SubscriptionPaymentOption[] = [
        { 
            id: 1, 
            name: 'Monthly Basic', 
            tokens: 600, 
            price: 14.99, 
            period: 'month', 
            description: 'Monthly access to tokens',
            features: [
                'Approximately 6 interviews or trainings monthly',
                'Standard support'
            ]
        },
        { 
            id: 2, 
            name: 'Monthly Premium', 
            tokens: 1500, 
            price: 29.99, 
            period: 'month', 
            description: 'Enhanced monthly package',
            popular: true,
            features: [
                'Approximately 15 interviews or trainings monthly',
                'Priority support'
            ]
        },
        { 
            id: 3, 
            name: 'Annual Premium', 
            tokens: 18000, 
            price: 249.99, 
            period: 'year', 
            description: 'Best value annual package',
            bestValue: true,
            features: [
                'VIP support',
                'Early access on new features'
            ]
        }
    ];

    // Handle purchase (placeholder function)
    const handlePurchase = (
        option: BasePaymentOption | SubscriptionPaymentOption, 
        type: 'onetime' | 'subscription'
    ) => {
        console.log(`Purchasing ${type} option:`, option);
        // Here you would implement the actual purchase logic
    };

    return (
        <Box sx={{ 
            background: 'linear-gradient(to bottom, #000000, #000846)',
            minHeight: '100vh',
            pt: 4,
            pb: 8
        }}>
            {/* Hero Section with Paper background */}
            <Paper
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    maxWidth: 'lg',
                    mx: 'auto',
                    mb: 6,
                    p: 3,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at top right, rgba(28, 181, 224, 0.2), transparent 70%)',
                        zIndex: 0
                    }
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" color="white" sx={{ mb: 1, maxWidth: '800px', mx: 'auto', opacity: 0.9 }}>
                        Choose the perfect plan to enhance your interview experience with our token system
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                        <LocalFireDepartmentIcon sx={{ color: '#FF6B6B', fontSize: '1.5rem' }} />
                        <StarIcon sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                        <LocalFireDepartmentIcon sx={{ color: '#FF6B6B', fontSize: '1.5rem' }} />
                    </Box>
                </Box>
            </Paper>

            <Container maxWidth="lg">
                {/* Payment Options Section with side-by-side headers */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center', 
                        mb: 4,
                        pb: 2,
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    }}>
                        {/* One-time Payment Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PaymentIcon sx={{ mr: 2, color: '#FFD700', fontSize: '2rem' }} />
                            <Typography variant="h6" fontWeight="bold" sx={{
                                background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                One-time Payment
                            </Typography>
                        </Box>

                        {/* Subscriptions Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SubscriptionsIcon sx={{ mr: 2, color: '#4CAF50', fontSize: '2rem' }} />
                            <Typography variant="h6" fontWeight="bold" sx={{
                                background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Subscriptions
                            </Typography>
                        </Box>
                    </Box>

                    {/* Single Grid container for all 6 cards */}
                    <Grid container spacing={2}>
                        {/* One-time payment options */}
                        {oneTimeOptions.map((option) => (
                            <Grid item xs={12} sm={6} md={2} key={`onetime-${option.id}`}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        borderRadius: '16px',
                                        position: 'relative',
                                        overflow: 'visible',
                                        width: 'calc(100% + 10px)', // Increase width by 10px
                                        marginLeft: '-5px', // Center the wider card
                                        background: option.bestValue 
                                            ? 'linear-gradient(135deg, #000846 0%, #1CB5E0 100%)' 
                                            : option.popular 
                                                ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
                                                : 'linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%)',
                                        color: 'white',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        boxShadow: option.bestValue || option.popular 
                                            ? '0 12px 24px rgba(0, 0, 0, 0.3)' 
                                            : '0 8px 16px rgba(0, 0, 0, 0.2)',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                                        }
                                    }}
                                >
                                    {/* Popular or Best Value badge */}
                                    {(option.popular || option.bestValue) && (
                                        <Chip
                                            icon={option.bestValue ? <StarIcon /> : <LocalFireDepartmentIcon />}
                                            label={option.bestValue ? "Best Value" : "Popular"}
                                            sx={{
                                                position: 'absolute',
                                                top: -25,
                                                right: 20,
                                                backgroundColor: option.bestValue ? '#FFD700' : '#FF6B6B',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                '& .MuiChip-icon': {
                                                    color: '#000'
                                                }
                                            }}
                                        />
                                    )}

                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        <Typography variant="h6" component="div" fontWeight="bold" gutterBottom sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                                            {option.name}
                                        </Typography>

                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 1,
                                            mt: 2,
                                            p: 1,
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: alpha('#fff', 0.1)
                                        }}>
                                            <AccountBalanceWalletIcon sx={{ color: '#FFD700', mr: 1, fontSize: '1.2rem' }} />
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {option.tokens} Tokens
                                            </Typography>
                                        </Box>

                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                mb: 1, 
                                                opacity: 0.8,
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            {option.description}
                                        </Typography>

                                        <Typography 
                                            variant="h5" 
                                            fontWeight="bold" 
                                            sx={{ 
                                                mb: 2,
                                                color: option.bestValue ? '#FFD700' : 'white'
                                            }}
                                        >
                                            ${option.price}
                                        </Typography>

                                        {/* Features list */}
                                        <Box sx={{ mb: 2 }}>
                                            {option.features.map((feature, index) => (
                                                <Box 
                                                    key={index} 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mb: 1 
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ 
                                                        mr: 1, 
                                                        color: option.bestValue ? '#FFD700' : '#4CAF50',
                                                        fontSize: '1rem'
                                                    }} />
                                                    <Typography variant="caption">{feature}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            onClick={() => handlePurchase(option, 'onetime')}
                                            sx={{
                                                backgroundColor: option.bestValue ? '#FFD700' : '#FFA500',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                borderRadius: '30px',
                                                py: 0.5,
                                                fontSize: '0.875rem',
                                                textTransform: 'none',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    backgroundColor: option.bestValue ? '#FFC400' : '#FF8C00',
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)'
                                                },
                                            }}
                                        >
                                            Purchase Now
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}

                        {/* Subscription options */}
                        {subscriptionOptions.map((option) => (
                            <Grid item xs={12} sm={6} md={2} key={`subscription-${option.id}`}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        borderRadius: '16px',
                                        position: 'relative',
                                        overflow: 'visible',
                                        width: 'calc(100% + 10px)', // Increase width by 10px
                                        marginLeft: '-5px', // Center the wider card
                                        background: option.bestValue 
                                            ? 'linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)' 
                                            : option.popular 
                                                ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
                                                : 'linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%)',
                                        color: 'white',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        boxShadow: option.bestValue || option.popular 
                                            ? '0 12px 24px rgba(0, 0, 0, 0.3)' 
                                            : '0 8px 16px rgba(0, 0, 0, 0.2)',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                                        }
                                    }}
                                >
                                    {/* Popular or Best Value badge */}
                                    {(option.popular || option.bestValue) && (
                                        <Chip
                                            icon={option.bestValue ? <StarIcon /> : <LocalFireDepartmentIcon />}
                                            label={option.bestValue ? "Best Value" : "Popular"}
                                            sx={{
                                                position: 'absolute',
                                                top: -25,
                                                right: 20,
                                                backgroundColor: option.bestValue ? '#8BC34A' : '#FF6B6B',
                                                color: option.bestValue ? '#000' : '#000',
                                                fontWeight: 'bold',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                '& .MuiChip-icon': {
                                                    color: '#000'
                                                }
                                            }}
                                        />
                                    )}

                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        <Typography variant="h6" component="div" fontWeight="bold" gutterBottom sx={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                                            {option.name}
                                        </Typography>

                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 1,
                                            mt: 2,
                                            p: 1,
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: alpha('#fff', 0.1)
                                        }}>
                                            <AccountBalanceWalletIcon sx={{ color: '#8BC34A', mr: 1, fontSize: '1.2rem' }} />
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {option.tokens} Tokens
                                            </Typography>
                                        </Box>

                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                mb: 1, 
                                                opacity: 0.8,
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            {option.description}
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="h5" fontWeight="bold" sx={{ 
                                                color: option.bestValue ? '#8BC34A' : 'white',
                                                display: 'inline-flex',
                                                alignItems: 'baseline'
                                            }}>
                                                ${option.price}
                                                <Typography 
                                                    variant="subtitle1" 
                                                    component="span" 
                                                    sx={{ 
                                                        ml: 1,
                                                        opacity: 0.7,
                                                        fontWeight: 'normal'
                                                    }}
                                                >
                                                    /{option.period}
                                                </Typography>
                                            </Typography>
                                        </Box>

                                        {/* Features list */}
                                        <Box sx={{ mb: 2 }}>
                                            {option.features.map((feature, index) => (
                                                <Box 
                                                    key={index} 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mb: 1 
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ 
                                                        mr: 1, 
                                                        color: option.bestValue ? '#8BC34A' : '#4CAF50',
                                                        fontSize: '1rem'
                                                    }} />
                                                    <Typography variant="caption">{feature}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            onClick={() => handlePurchase(option, 'subscription')}
                                            sx={{
                                                backgroundColor: option.bestValue ? '#8BC34A' : '#4CAF50',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                borderRadius: '30px',
                                                py: 0.5,
                                                fontSize: '0.875rem',
                                                textTransform: 'none',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    backgroundColor: option.bestValue ? '#7CB342' : '#388E3C',
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)'
                                                },
                                            }}
                                        >
                                            Subscribe Now
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default PaymentPage;
