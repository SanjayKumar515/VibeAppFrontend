import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  unreadCounts: Record<string, number>;
  activeChatRoomId: string | null;
}

const initialState: ChatState = {
  unreadCounts: {},
  activeChatRoomId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    incrementUnread: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.activeChatRoomId !== conversationId) {
        state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
      }
    },
    clearUnread: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;
    },
    setActiveChatRoom: (state, action: PayloadAction<string | null>) => {
      state.activeChatRoomId = action.payload;
      if (action.payload) {
        state.unreadCounts[action.payload] = 0; // also clear unread when entering
      }
    },
    setAllUnreadCounts: (state, action: PayloadAction<Record<string, number>>) => {
      state.unreadCounts = action.payload;
    }
  },
});

export const { incrementUnread, clearUnread, setActiveChatRoom, setAllUnreadCounts } = chatSlice.actions;
export default chatSlice.reducer;
