const { CognitoJwtVerifier } = require("aws-jwt-verify");


const jwtVerifier = CognitoJwtVerifier.create({
  tokenUse: "id",
  userPoolId: process.env.COGNITO_USERPOOL_ID,
  clientId: process.env.COGNITO_WEB_CLIENT_ID,
})

const generatePolicy = (principalId, effect, resource) => {
    const authReponse = {};

    authReponse.principalId = principalId;
    if (effect && resource) {
      const policyDocument = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: effect,
            Resource: resource,
            Action: "execute-api:Invoke",
          },
        ],
      };
      
      authReponse.policyDocument = policyDocument;
    }
    authReponse.context = {
        test: "test"
    }

    console.log(JSON.stringify(authReponse));
    return authReponse;
  };

exports.handler = async (event, _context, callback) => {
  const token = event.authorizationToken; 

  console.log({ token });

  try {
    const payload = await jwtVerifier.verify(token);
    console.log(JSON.stringify(payload));

    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch(err) {
    callback("Error: Invalid token..");
  }
};
