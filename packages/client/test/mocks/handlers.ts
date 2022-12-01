import { rest } from 'msw';

import type { AccessTokenApiResponse } from '~credentials/types';

const handlers = [
  rest.get<any, any, AccessTokenApiResponse>(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate',
    (req, res, ctx) => {
      const { username, password } = req.url;
      if (username === 'consumerKey' && password === 'consumerSecret')
        return res(
          ctx.status(200),
          ctx.json({
            access_token: '0lfGXGBYMizXb4q5lEoK5duYRZ0O',
            expires_in: '3599',
          })
        );
      return res(ctx.status(400, 'Bad Request: Invalid Credentials'));
    }
  ),
];

export default handlers;
