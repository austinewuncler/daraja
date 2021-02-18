import MpesaAPIBuilder from "./mpesa.api.builder";

const builder = (
  shortcode: string | number,
  consumerKey: string,
  conmsumerSecret: string
): MpesaAPIBuilder => {
  return new MpesaAPIBuilder(+shortcode, consumerKey, conmsumerSecret);
};

export default builder;
