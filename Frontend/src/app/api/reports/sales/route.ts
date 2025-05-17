import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(request: Request) {
    const token = await getSession('auth_token')
    const body = await request.json()
    
    if (!body.start_date || !body.end_date) {
        return Response.json({
            status: 'error',
            message: 'Start date and end date are required'
        }, { status: 400 });
    }
    
    try {
        // Fetch orders within date range
        const res = await BackendAxios.get(`view/orders?date_from=${body.start_date}&date_to=${body.end_date}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        // Fetch statistics for the date range
        const statsRes = await BackendAxios.get(`view/orders/stats?date_from=${body.start_date}&date_to=${body.end_date}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (res.data.status === 'success' && statsRes.data.status === 'success') {
            // Process data to group by date
            const orders = res.data.data.data || [];
            const salesByDate = new Map();
            
            // Group orders by date
            orders.forEach((order: any) => {
                const date = new Date(order.created_at || order.order_date).toISOString().split('T')[0];
                
                if (!salesByDate.has(date)) {
                    salesByDate.set(date, {
                        date,
                        orders: [],
                        total_orders: 0,
                        total_sales: 0
                    });
                }
                
                const dateData = salesByDate.get(date);
                dateData.orders.push(order);
                dateData.total_orders++;
                dateData.total_sales += parseFloat(order.total || order.total_amount || 0);
            });
            
            // Calculate avg order value and format data
            const salesData = Array.from(salesByDate.values()).map(item => ({
                date: item.date,
                total_orders: item.total_orders,
                total_sales: parseFloat(item.total_sales.toFixed(2)),
                avg_order_value: item.total_orders > 0 
                    ? parseFloat((item.total_sales / item.total_orders).toFixed(2)) 
                    : 0
            })).sort((a, b) => a.date.localeCompare(b.date));
            
            // Get summary from stats
            const summary = {
                total_orders: statsRes.data.data.total_orders || 0,
                total_sales: parseFloat((statsRes.data.data.total_sales || 0).toFixed(2)),
                avg_order_value: parseFloat((statsRes.data.data.avg_order_value || 0).toFixed(2))
            };
            
            return Response.json({
                status: 'success',
                data: {
                    sales: salesData,
                    summary
                }
            });
        }
        
        return Response.json({
            status: 'error',
            message: 'Failed to generate sales report'
        }, { status: 500 });
    } catch (error) {
        console.error('Error generating sales report:', error);
        return Response.json({
            status: 'error',
            message: 'An error occurred while generating the sales report'
        }, { status: 500 });
    }
}