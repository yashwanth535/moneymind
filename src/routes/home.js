const express = require("express");
const router = express.Router();
const getExpenseModel = require("../models/expense");

router.get('/', (req, res) => {
    console.log("home rendering");
    res.render('home', { email: req.session.user.email }); 
});

router.get('/dashboard', async (req, res) => {
    const email = req.session.user.email;
    console.log(email);
    const Expense = getExpenseModel(email);
  
    try {
        // Fetch total expenses
        const total = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Fetch expense trend data for line chart
        const expenseTrend = await Expense.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, total: { $sum: "$amount" } } },
            { $sort: { _id: 1 } } // Sort by date
        ]);

        // Fetch data for pie chart grouped by purpose
        const expenseByPurpose = await Expense.aggregate([
            { $group: { _id: "$purpose", total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            total: total[0]?.total || 0, // Total expenses
            expenseTrend, // Expense trend data for line chart
            expenseByPurpose // Expense data for pie chart
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/debits', async (req, res) => {
    const email = req.session.user.email;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const Expense = getExpenseModel(email);

        // Get the start and end dates of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Calculate total debit for the month
        const totalDebit = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        // Fetch the last 5 debits
        const lastDebits = await Expense.find({
            date: { $gte: startOfMonth, $lte: endOfMonth },
        })
            .sort({ date: -1 }) // Sort by date (newest first)
            .limit(8) // Limit to the last 5 records
            .select('date amount'); // Select only date and amount fields

        res.status(200).json({
            totalDebit: totalDebit[0]?.total || 0, // Default to 0 if no records
            lastDebits,
        });
    } catch (err) {
        console.error('Error fetching debits:', err);
        res.status(500).json({ error: 'Error fetching debits', details: err.message });
    }
});



module.exports = router;

