export const handler = async (event) => {
  console.log("Lex Event:", JSON.stringify(event));

  const intentName = event.sessionState.intent.name;

  let message;

  switch (intentName) {

      case "GreetingIntent":
          message = "Hello! Welcome to our customer support service. How can I help you today?";
          break;

      case "HelpIntent":
          message = "I can help you check your order status, track an order, and provide basic customer support.";
          break;

      case "CheckOrderStatusIntent":

          const orderId =
              event.sessionState.intent.slots.OrderID.value.interpretedValue;

          // Simulated order database
          const orders = {
              "ORD12345": "Your order ORD12345 is currently being processed.",
              "ORD67890": "Your order ORD67890 has been shipped and is on its way.",
              "ORD99999": "Your order ORD99999 has been delivered."
          };

          message =
              orders[orderId] ||
              `We could not find an order with ID ${orderId}. Please check the order ID and try again.`;

          break;

      case "GoodbyeIntent":
          message = "Thank you for contacting customer support. Have a great day!";
          break;

      default:
          message = "Sorry, I didn't understand your request. Please try again.";
  }

  return {
      sessionState: {
          dialogAction: {
              type: "Close"
          },
          intent: {
              name: intentName,
              state: "Fulfilled"
          }
      },

      messages: [
          {
              contentType: "PlainText",
              content: message
          }
      ]
  };
};