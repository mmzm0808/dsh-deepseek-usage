/**
 * DeepSeek Platform login helper. Opens a local Chromium-family browser window
 * (Chrome, Edge, Brave, Chromium, etc.) pointed at the platform, lets the user
 * sign in manually, then reads `userToken` from the page's localStorage over
 * the Chrome DevTools Protocol. The token is only stored as a plugin config
 * item; it is never embedded in plugin code.
 * @module dsh-deepseek-usage/login
 */
/** Open a visible Chromium-family window logged into the DeepSeek platform. */
export declare function startPlatformLogin(): Promise<{
    port: number;
}>;
/** Read the platform `userToken` from the open browser via CDP. */
export declare function readPlatformTokenFromBrowser(port: number): Promise<string | undefined>;
/** Close the login browser and remove its temporary profile. */
export declare function closePlatformLogin(): void;
