import { Availability } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

export const getAvailabilities = createAsyncThunk(
  'getAvailabilities',
  async (practitionerId) => {
    const response = await fetch(
      `${SERVER_API_ENDPOINT}/availabilities?practitionerId=${practitionerId}`,
    );
    const parsedResponse = await response.json();
    return parseIds(parsedResponse) as Availability[];
  },
);

const availabilitiesAdapter = createEntityAdapter<Availability>({
  sortComparer: (a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
});

export const availabilitiesSelectors = availabilitiesAdapter.getSelectors();

const availabilitiesSlice = createSlice({
  name: 'availabilities',
  initialState: availabilitiesAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAvailabilities.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAvailabilities.fulfilled, (state, action) => {
      availabilitiesAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getAvailabilities.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default availabilitiesSlice;
