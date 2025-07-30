export function cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
}
