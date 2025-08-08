// src/pages/Login.jsx
import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Axios from 'axios';
import { useImmerReducer } from 'use-immer';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';

// Optional global auth context (if you use it)
import DispatchContext from '../Contexts/DispatchContext';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';
const LOGIN_URL = `${API_BASE}/api-auth-djoser/token/login/`; // Djoser authtoken
const ME_URL = `${API_BASE}/api-auth-djoser/users/me/`;       // Djoser “me”

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const GlobalDispatch = useContext(DispatchContext);

  const initialState = {
    usernameValue: '',
    passwordValue: '',
    sendRequest: 0,
    token: '',
    openSnack: false,
    disabledBtn: false,
    serverError: false,
    serverMessage: '',
  };

  function ReducerFunction(draft, action) {
    switch (action.type) {
      case 'catchUsernameChange':
        draft.usernameValue = action.usernameChosen;
        draft.serverError = false;
        draft.serverMessage = '';
        break;
      case 'catchPasswordChange':
        draft.passwordValue = action.passwordChosen;
        draft.serverError = false;
        draft.serverMessage = '';
        break;
      case 'changeSendRequest':
        draft.sendRequest++;
        break;
      case 'catchToken':
        draft.token = action.tokenValue;
        break;
      case 'openTheSnack':
        draft.openSnack = true;
        break;
      case 'disableTheButton':
        draft.disabledBtn = true;
        break;
      case 'allowTheButton':
        draft.disabledBtn = false;
        break;
      case 'catchServerError':
        draft.serverError = true;
        draft.serverMessage = action.message || 'Login failed';
        break;
      default:
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(ReducerFunction, initialState);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'changeSendRequest' });
    dispatch({ type: 'disableTheButton' });
  };

  // Step 1: login (username + password) → get token
  useEffect(() => {
    if (!state.sendRequest) return;
    const source = Axios.CancelToken.source();

    async function signIn() {
      try {
        const res = await Axios.post(
          LOGIN_URL,
          {
            // ⬇️ old working version uses username, not email
            username: state.usernameValue,
            password: state.passwordValue,
          },
          { cancelToken: source.token }
        );

        const token = res.data?.auth_token;
        dispatch({ type: 'catchToken', tokenValue: token });
        GlobalDispatch?.({ type: 'catchToken', tokenValue: token });
        localStorage.setItem('auth_token', token);
      } catch (error) {
        let msg = 'Incorrect username or password!';
        if (error?.response?.data) {
          const data = error.response.data;
          if (data.non_field_errors?.length) msg = data.non_field_errors[0];
          else if (data.detail) msg = data.detail;
        }
        dispatch({ type: 'allowTheButton' });
        dispatch({ type: 'catchServerError', message: msg });
      }
    }

    signIn();
    return () => source.cancel();
  }, [state.sendRequest]);

  // Step 2 (optional but matches old flow): fetch user info with token
  useEffect(() => {
    if (!state.token) return;
    const source = Axios.CancelToken.source();

    async function getMe() {
      try {
        const res = await Axios.get(ME_URL, {
          headers: { Authorization: `Token ${state.token}` },
          cancelToken: source.token,
        });

        GlobalDispatch?.({
          type: 'userSignsIn',
          usernameInfo: res.data.username,
          emailInfo: res.data.email,
          IdInfo: res.data.id,
        });

        dispatch({ type: 'openTheSnack' });
      } catch (error) {
        // token is fine if login succeeded; don’t block UI on /me/ failing
        dispatch({ type: 'openTheSnack' });
      } finally {
        dispatch({ type: 'allowTheButton' });
      }
    }

    getMe();
    return () => source.cancel();
  }, [state.token]);

  // Navigate after toast
  useEffect(() => {
    if (state.openSnack) {
      const t = setTimeout(() => navigate('/'), 1200);
      return () => clearTimeout(t);
    }
  }, [state.openSnack, navigate]);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, px: 3 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Sign In
        </Typography>

        {state.serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.serverMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            required
            label="Username"
            name="username"
            value={state.usernameValue}
            onChange={(e) =>
              dispatch({ type: 'catchUsernameChange', usernameChosen: e.target.value })
            }
            error={state.serverError}
          />
          <TextField
            fullWidth
            margin="normal"
            required
            label="Password"
            name="password"
            type="password"
            value={state.passwordValue}
            onChange={(e) =>
              dispatch({ type: 'catchPasswordChange', passwordChosen: e.target.value })
            }
            error={state.serverError}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={state.disabledBtn}
          >
            {state.disabledBtn ? 'Logging in…' : 'Login'}
          </Button>
          <Typography mt={2} textAlign="center" variant="body2">
            Don’t have an account?{' '}
            <Link to="/signup" style={{ color: theme.palette.primary.main }}>
              Sign Up
            </Link>
          </Typography>
        </form>
      </Paper>

      <Snackbar
        open={state.openSnack}
        message="You have successfully logged in"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Login;
