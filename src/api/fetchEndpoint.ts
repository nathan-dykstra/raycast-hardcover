import fetch from "node-fetch";
import { ENDPOINT, HARDCOVER_TOKEN } from "../utils/constants";

export async function fetchGraphQL(operation: string) {
    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HARDCOVER_TOKEN}`
            },
            body: JSON.stringify({ query: operation })
        });
    
        return response.json();
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch data');
    }
}