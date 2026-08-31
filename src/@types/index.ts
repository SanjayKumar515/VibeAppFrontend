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
};

export type AppStackProps = {
  HomeTabs: undefined;
  ChatRoom: { chatId: string; name: string; avatar: string };
  Profile: undefined;
  Contacts: undefined;
};
