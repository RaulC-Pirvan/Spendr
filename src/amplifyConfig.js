import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_EJbPeGaMy",
      userPoolClientId: "7ti1laeq1ee5etqlfbh10o1ekv",
      loginWith: {
        email: true,
      },
    },
  },
});