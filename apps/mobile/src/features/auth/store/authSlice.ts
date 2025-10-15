import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  LoginUserRequest,
  VerifyUserRequest,
  RegisterUserRequest,
  RecoverUserRequest,
} from "@bitsacco/core";
import type { MobileUser } from "../../../types/auth";
import { adaptCoreUserToMobile } from "../../../types/auth";
import { mobileAuthService } from "../../../services/mobileAuthService";

export interface AuthState {
  isAuthenticated: boolean;
  user: MobileUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunks for auth actions
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginUserRequest, { rejectWithValue }) => {
    try {
      const authResponse = await mobileAuthService.login(credentials);

      if (authResponse.user && authResponse.accessToken) {
        return {
          user: adaptCoreUserToMobile(authResponse.user),
          token: authResponse.accessToken,
        };
      } else {
        throw new Error("Login successful but user data incomplete");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterUserRequest, { rejectWithValue }) => {
    try {
      const authResponse = await mobileAuthService.register(userData);

      if (authResponse.user) {
        return {
          user: adaptCoreUserToMobile(authResponse.user),
          token: authResponse.accessToken,
          needsVerification: !authResponse.accessToken,
        };
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (request: VerifyUserRequest, { rejectWithValue }) => {
    try {
      const authResponse = await mobileAuthService.verify(request);

      if (authResponse.user) {
        return {
          user: adaptCoreUserToMobile(authResponse.user),
          token: authResponse.accessToken,
          needsVerification: !authResponse.accessToken,
        };
      } else {
        throw new Error("Verification failed");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Verification failed");
    }
  }
);

export const recoverUser = createAsyncThunk(
  "auth/recoverUser",
  async (request: RecoverUserRequest, { rejectWithValue }) => {
    try {
      const authResponse = await mobileAuthService.recover(request);

      if (authResponse.user) {
        return {
          user: adaptCoreUserToMobile(authResponse.user),
          token: authResponse.accessToken,
          needsVerification: !authResponse.accessToken,
        };
      } else {
        throw new Error("Recovery failed");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Recovery failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await mobileAuthService.logout();
  return null;
});

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const user = await mobileAuthService.getCurrentUser();
      const isAuthenticated = await mobileAuthService.isAuthenticated();

      if (isAuthenticated && user) {
        const token = await mobileAuthService.getAccessToken();
        return {
          user: adaptCoreUserToMobile(user),
          token,
        };
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check auth status");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify cases
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
        }
        state.error = null;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Recover cases
      .addCase(recoverUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recoverUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
        }
        state.error = null;
      })
      .addCase(recoverUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearError, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
