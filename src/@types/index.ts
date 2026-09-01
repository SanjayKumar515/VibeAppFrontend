export type AuthStackProps = {
  Onboarding: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  SignUp: undefined;
};

export type HomeStackProps = {
  Home: undefined;
  Dashboard: undefined;
  Status: undefined;
  Communities: undefined;
  Settings: undefined;
  CallHistory: undefined;
};

export type AppStackProps = {
  HomeTabs: undefined;
  ChatRoom: { chatId: string; name: string; avatar: string; targetUserId?: string };
  Profile: undefined;
  Contacts: undefined;
  CallScreen: { targetUserId: string; targetName: string; isCaller: boolean; incomingSignal?: any; isVideo?: boolean };
  IncomingCallScreen: { callerId: string; callerName: string; callerAvatar: string; signal: any };
};
