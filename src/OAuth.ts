// OAuth class for handling OAuth2 authentication
// Port of the Python udi_interface OAuth class

import logger from './logger.js';
import type { Interface } from './Interface.js';
import axios from 'axios';

interface OAuthConfig {
  auth_endpoint?: string;
  token_endpoint?: string;
  client_id?: string;
  client_secret?: string;
  scope?: string;
  addScope?: boolean;
  addRedirect?: boolean;
  parameters?: Record<string, any>;
  token_parameters?: Record<string, any>;
}

interface OAuthTokens {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expiry?: string;
  [key: string]: any;
}

export class OAuth {
  private polyInterface: Interface;
  private _oauthConfig: OAuthConfig;
  private _oauthTokens: OAuthTokens;
  private _oauthConfigInitialized: boolean;
  private _oauthConfigOverride: OAuthConfig;
  private _refreshTimer: NodeJS.Timeout | null;
  
  // Constants
  private static readonly REFRESH_BUFFER_MS = 60000; // 60 seconds

  constructor(polyInterface: Interface) {
    this.polyInterface = polyInterface;
    this._oauthConfig = {};
    this._oauthTokens = {};
    this._oauthConfigInitialized = false;
    this._oauthConfigOverride = {};
    this._refreshTimer = null;
  }

  // Handler for CUSTOMNS events containing oauth configuration
  customNsHandler(key: string, data: any) {
    if (key === 'oauth') {
      // Load the oauth config from PG3
      this._oauthConfig = { ...data };

      // Apply any overrides
      this._oauthConfig = { ...this._oauthConfig, ...this._oauthConfigOverride };

      this._oauthConfigInitialized = true;

      // Validate configuration
      if (!this._oauthConfig.auth_endpoint) {
        logger.error('oAuth configuration is missing auth_endpoint');
      }
      if (!this._oauthConfig.token_endpoint) {
        logger.error('oAuth configuration is missing token_endpoint');
      }
      if (!this._oauthConfig.client_id) {
        logger.error('oAuth configuration is missing client_id');
      }
      if (!this._oauthConfig.client_secret) {
        logger.error('oAuth configuration is missing client_secret');
      }
    }

    if (key === 'oauthTokens') {
      this._oauthTokens = { ...data };
      this._updateRefreshTimer();
    }
  }

  // Handler for OAUTH events containing new tokens
  oauthHandler(token: OAuthTokens) {
    logger.info('Received oAuth tokens');
    this._setExpiry(token);
    this._oauthTokens = { ...token };
    
    // Save tokens back to PG3
    this.polyInterface.sendMessage(
      { set: [{ key: 'oauthTokens', value: this._oauthTokens }] },
      'custom'
    );
    
    this._updateRefreshTimer();
  }

  // Add expiry timestamp to token
  private _setExpiry(token: OAuthTokens) {
    if (token.expires_in) {
      const expiryDate = new Date(Date.now() + token.expires_in * 1000);
      token.expiry = expiryDate.toISOString();
    }
  }

  // Set up timer to refresh token before expiry
  private _updateRefreshTimer() {
    const expiry = this._oauthTokens.expiry;

    if (!expiry) {
      logger.error('Starting refresh timer: No expiry found on oAuthTokens');
      return;
    }

    // Cancel existing timer
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }

    // Calculate refresh time (60 seconds before expiry)
    const expiryDate = new Date(expiry);
    const refreshDate = new Date(expiryDate.getTime() - OAuth.REFRESH_BUFFER_MS);
    const now = new Date();

    // If already expired, refresh immediately
    if (refreshDate <= now) {
      logger.info(`Refresh token already expired at: ${expiry}. Attempting to renew.`);
      this.getAccessToken().catch(error => {
        logger.error(`Error refreshing expired token: ${error.message}`);
      });
      return;
    }

    // Set up timer
    logger.info(`Refresh token will be refreshed at: ${refreshDate.toISOString()}`);
    const delay = refreshDate.getTime() - now.getTime();
    this._refreshTimer = setTimeout(() => {
      this.getAccessToken().catch(error => {
        logger.error(`Error in scheduled token refresh: ${error.message}`);
      });
    }, delay);
  }

  // Refresh the OAuth tokens
  private async _oAuthTokensRefresh(): Promise<void> {
    logger.debug('Refreshing OAuth tokens');

    const data: Record<string, any> = {
      grant_type: 'refresh_token',
      refresh_token: this._oauthTokens.refresh_token,
      client_id: this._oauthConfig.client_id,
      client_secret: this._oauthConfig.client_secret,
    };

    // Add redirect_uri if configured
    if (this._oauthConfig.addRedirect) {
      data.redirect_uri = 'https://my.isy.io/api/cloudlink/redirect';
    }

    // Add scope if configured (default is true)
    if (this._oauthConfig.addScope !== false && this._oauthConfig.scope) {
      data.scope = this._oauthConfig.scope;
    }

    // Add any custom token parameters
    if (this._oauthConfig.token_parameters) {
      Object.assign(data, this._oauthConfig.token_parameters);
    }

    try {
      const response = await axios.default.post(this._oauthConfig.token_endpoint!, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        transformRequest: [(data) => {
          return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
        }],
      });

      const token = response.data;
      logger.info('Refreshing oAuth tokens successfully');
      
      this._setExpiry(token);

      // Keep existing data and merge with new tokens
      this._oauthTokens = { ...this._oauthTokens, ...token };

      // Save tokens back to PG3
      this.polyInterface.sendMessage(
        { set: [{ key: 'oauthTokens', value: this._oauthTokens }] },
        'custom'
      );

      this._updateRefreshTimer();
    } catch (error: any) {
      logger.error(`Failed to refresh oAuth token: ${error.message}`);
      if (error.response) {
        logger.error(error.response.data);
      }
      // Keep existing tokens available on failure
    }
  }

  // Get the access token, refreshing if necessary
  async getAccessToken(): Promise<string> {
    // Check if we have tokens
    if (!this._oauthTokens.refresh_token) {
      throw new Error('Access token is not available');
    }

    const expiry = this._oauthTokens.expiry;

    // If expired or expiring in less than 60 seconds, refresh
    if (!expiry || new Date(expiry).getTime() - OAuth.REFRESH_BUFFER_MS < Date.now()) {
      logger.info(`Access tokens: Token is expired since ${expiry}. Initiating refresh.`);
      // Await the refresh to ensure we have fresh tokens
      await this._oAuthTokensRefresh();
    } else {
      logger.debug(`Access tokens: Token is still valid until ${expiry}, no need to refresh`);
    }

    if (!this._oauthTokens.access_token) {
      throw new Error('Access token is not available');
    }

    return this._oauthTokens.access_token;
  }

  // Update OAuth settings (for dynamic configuration)
  updateOauthSettings(update: OAuthConfig) {
    this._oauthConfigOverride = { ...this._oauthConfigOverride, ...update };

    // If config already initialized, apply updates now
    if (this._oauthConfigInitialized) {
      this._oauthConfig = { ...this._oauthConfig, ...update };
      
      // Save updated config back to PG3
      this.polyInterface.sendMessage(
        { set: [{ key: 'oauth', value: this._oauthConfig }] },
        'custom'
      );
    }
  }

  // Get current OAuth settings
  getOauthSettings(): OAuthConfig {
    return { ...this._oauthConfig };
  }
}
