import API_BASE_URL from '../config';

const API_KEY = "jzd0ze44qn0un9q1cqs7spi130mjtu";

export interface BitcoTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  url: string;
  duration: number;
  image?: string;
  category?: string;
  requirements?: string;
  country?: string;
  device?: string;
}

export const fetchBitcoTasks = async (userId: string): Promise<BitcoTask[]> => {
  try {
    // Get user IP
    let userIp = '';
    try {
      const ipResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const ipText = await ipResponse.text();
      const lines = ipText.split('\n');
      const ipLine = lines.find(line => line.startsWith('ip='));
      userIp = ipLine ? ipLine.split('=')[1] : '';
    } catch (error) {
      console.error("Error fetching IP:", error);
    }

    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}/tasks/api/ptc-tasks`);
    url.searchParams.append('apiKey', API_KEY);
    url.searchParams.append('userId', userId);
    url.searchParams.append('userIp', userIp);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    }
    
    return [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("Request timeout - PTC tasks fetch aborted");
    } else {
      console.error("Error fetching BitcoTasks:", error);
    }
    return [];
  }
};