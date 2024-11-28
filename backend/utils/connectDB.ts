import mongoose from "mongoose";
const connectDBANDSERVER = (url: string, port: number, app: any) => {
  console.log(mongoose.connection.readyState);
  mongoose
    .connect(url)
    .then(() =>
      console.log(
        `Connected to MONGODB to database ${url
          .split("/")
          [url.split("/").length - 1].toUpperCase()}`
      )
    )
    .catch((error) => console.log(`Could not connect to mongodb \e ${error}`))
    .finally(() => {
      console.log(mongoose.connection.readyState);
      app.listen(port, () =>
        console.log(`New server is running on port ${port}`)
      );
    })
    .catch((error) => console.log(error));
};

export default connectDBANDSERVER;
