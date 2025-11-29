import { supabase } from './supabase';

export interface UsageLog {
    id?: string;
    user_id: string;
    feature: string;
    input_images: number;
    input_chars: number;
    output_images: number;
    tokens: number;
    estimated_cost: number;
    created_at?: string;
}

// Gemini Flash Real-Time API pricing
const INPUT_COST_PER_MILLION = 0.075; // $0.075 per 1M input tokens (real-time)
const OUTPUT_COST_PER_MILLION = 0.30; // $0.30 per 1M output tokens (text, real-time)
// Real-time image generation cost
const IMAGE_GENERATION_COST = 0.041; // $0.041 per image (real-time API)

// Token estimation helpers
// Rough estimate: 1 token ≈ 4 characters for text
// For images: base64 encoded images are roughly 256 tokens per image (conservative estimate)
export function estimateTokens(inputImages: number, inputChars: number, outputImages: number): number {
    const imageTokens = inputImages * 256; // Conservative estimate
    const textTokens = Math.ceil(inputChars / 4); // ~4 chars per token
    // Output images don't count as tokens in the same way, but we track them separately
    return imageTokens + textTokens;
}

export function calculateCost(tokens: number, outputImages: number): number {
    // Calculate input cost
    const inputCost = (tokens / 1_000_000) * INPUT_COST_PER_MILLION;
    
    // Calculate output image cost
    const imageCost = outputImages * IMAGE_GENERATION_COST;
    
    return inputCost + imageCost;
}

export async function logUsage(
    userId: string,
    feature: string,
    inputImages: number,
    inputChars: number,
    outputImages: number
): Promise<void> {
    try {
        const tokens = estimateTokens(inputImages, inputChars, outputImages);
        const estimatedCost = calculateCost(tokens, outputImages);

        const { error } = await supabase
            .from('usage_logs')
            .insert({
                user_id: userId,
                feature,
                input_images: inputImages,
                input_chars: inputChars,
                output_images: outputImages,
                tokens,
                estimated_cost: estimatedCost,
            });

        if (error) {
            console.error('Failed to log usage:', error);
            // Don't throw - we don't want usage tracking to break the main flow
        }
    } catch (error) {
        console.error('Error logging usage:', error);
        // Silently fail - usage tracking should not break the app
    }
}

export async function getUserUsageLogs(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
): Promise<{ logs: UsageLog[]; total: number }> {
    try {
        // Get total count
        const { count, error: countError } = await supabase
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            console.error('Failed to fetch usage logs count:', countError);
        }

        // Get paginated logs
        const { data, error } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Failed to fetch usage logs:', error);
            return { logs: [], total: 0 };
        }

        return { logs: data || [], total: count || 0 };
    } catch (error) {
        console.error('Error fetching usage logs:', error);
        return { logs: [], total: 0 };
    }
}

export async function getUserUsageStats(userId: string): Promise<{
    totalCost: number;
    totalImages: number;
    totalTokens: number;
}> {
    try {
        const { data, error } = await supabase
            .from('usage_logs')
            .select('estimated_cost, output_images, tokens')
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to fetch usage stats:', error);
            return { totalCost: 0, totalImages: 0, totalTokens: 0 };
        }

        const stats = (data || []).reduce(
            (acc, log) => ({
                totalCost: acc.totalCost + (log.estimated_cost || 0),
                totalImages: acc.totalImages + (log.output_images || 0),
                totalTokens: acc.totalTokens + (log.tokens || 0),
            }),
            { totalCost: 0, totalImages: 0, totalTokens: 0 }
        );

        return stats;
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        return { totalCost: 0, totalImages: 0, totalTokens: 0 };
    }
}

export async function clearUserUsageHistory(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('usage_logs')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to clear usage history:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error clearing usage history:', error);
        throw error;
    }
}

