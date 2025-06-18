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
        // Fetch expenses within date range
        const res = await BackendAxios.get(`view/expenses?date_from=${body.start_date}&date_to=${body.end_date}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        // Fetch statistics for the date range
        const statsRes = await BackendAxios.get(`view/expenses/stats?date_from=${body.start_date}&date_to=${body.end_date}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (res.data.status === 'success' && statsRes.data.status === 'success') {
            // Process data to group by date
            const expenses = res.data.data.data || [];
            const expensesByDate = new Map();
            
            // Group expenses by date
            expenses.forEach((expense: any) => {
                const date = new Date(expense.expense_date).toISOString().split('T')[0];
                
                if (!expensesByDate.has(date)) {
                    expensesByDate.set(date, {
                        date,
                        expenses: [],
                        total_expenses: 0,
                        total_amount: 0,
                        expenses_by_type: {}
                    });
                }
                
                const dateData = expensesByDate.get(date);
                dateData.expenses.push(expense);
                dateData.total_expenses++;
                dateData.total_amount += parseFloat(expense.amount || 0);
                
                // Group by expense type
                const typeName = expense.expense_type_name || 'Other';
                if (!dateData.expenses_by_type[typeName]) {
                    dateData.expenses_by_type[typeName] = 0;
                }
                dateData.expenses_by_type[typeName] += parseFloat(expense.amount || 0);
            });
            
            // Format data for report
            const reportData = Array.from(expensesByDate.values()).map(item => ({
                date: item.date,
                total_expenses: item.total_expenses,
                total_amount: parseFloat(item.total_amount.toFixed(2)),
                expenses_by_type: item.expenses_by_type
            })).sort((a, b) => a.date.localeCompare(b.date));
            
            // Get summary from stats
            const summary = {
                total_expenses: statsRes.data.data.total_expenses || 0,
                total_amount: parseFloat((statsRes.data.data.total_amount || 0).toFixed(2)),
                avg_expense_amount: statsRes.data.data.total_expenses > 0 
                    ? parseFloat(((statsRes.data.data.total_amount || 0) / statsRes.data.data.total_expenses).toFixed(2))
                    : 0
            };
            
            return Response.json({
                status: 'success',
                data: {
                    expenses: reportData,
                    summary
                }
            });
        }
        
        return Response.json({
            status: 'error',
            message: 'Failed to generate expense report'
        }, { status: 500 });
    } catch (error) {
        console.error('Error generating expense report:', error);
        return Response.json({
            status: 'error',
            message: 'An error occurred while generating the expense report'
        }, { status: 500 });
    }
}