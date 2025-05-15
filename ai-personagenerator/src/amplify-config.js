import { Amplify } from 'aws-amplify';
console.log('COnfiguring amplify')



const config = {
  Analytics: {
    AWSPinpoint: {
      appId: 'bcaa20a5376040c8b76fdeaa8fc59825',
      region: 'us-east-1',
      // Optional: allows unauthenticated guest users to send analytics
      mandatorySignIn: false
    },
  },
}
Amplify.configure(config);
