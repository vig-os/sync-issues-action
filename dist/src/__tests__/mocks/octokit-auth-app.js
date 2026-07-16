export const createAppAuth = jest.fn(() => {
    return jest.fn(async (options) => {
        if (options.type === 'app') {
            return { token: 'mock-app-token' };
        }
        if (options.type === 'installation') {
            return { token: 'mock-installation-token' };
        }
        return { token: 'mock-token' };
    });
});
