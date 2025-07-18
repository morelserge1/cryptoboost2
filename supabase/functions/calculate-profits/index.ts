
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active investments
    const { data: investments, error: investmentsError } = await supabaseClient
      .from('investments')
      .select('*')
      .eq('status', 'active')

    if (investmentsError) {
      throw investmentsError
    }

    const updates = []

    for (const investment of investments) {
      const startDate = new Date(investment.start_date)
      const endDate = new Date(investment.end_date)
      const now = new Date()
      
      // Calculate elapsed time in milliseconds
      const totalDuration = endDate.getTime() - startDate.getTime()
      const elapsedTime = now.getTime() - startDate.getTime()
      
      // Calculate progress percentage
      const progress = Math.min(elapsedTime / totalDuration, 1)
      
      // Calculate current profit based on progress
      const currentProfit = investment.expected_profit * progress
      
      // Check if investment is completed
      const isCompleted = now >= endDate
      
      updates.push({
        id: investment.id,
        current_profit: currentProfit,
        status: isCompleted ? 'completed' : 'active',
        last_profit_update: now.toISOString()
      })
    }

    // Update investments
    for (const update of updates) {
      const { error: updateError } = await supabaseClient
        .from('investments')
        .update(update)
        .eq('id', update.id)

      if (updateError) {
        console.error('Error updating investment:', updateError)
      }

      // If investment is completed, update user balance
      if (update.status === 'completed') {
        const investment = investments.find(inv => inv.id === update.id)
        if (investment) {
          // Add profit to user balance
          const { error: balanceError } = await supabaseClient.rpc('add_profit_to_balance', {
            user_id: investment.user_id,
            profit_amount: investment.expected_profit
          })

          if (balanceError) {
            console.error('Error updating user balance:', balanceError)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Profits calculated successfully', updates: updates.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
