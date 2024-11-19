export function isValidISBN10(query: string) {
    return query.length === 10 && /^\d{9}[\dXx]$/.test(query);
}

export function isValidISBN13(query: string) {
    return query.length === 13 && /^\d{13}$/.test(query);
}