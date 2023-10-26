/* eslint-disable @typescript-eslint/no-unused-vars */

// @ts-ignore
import {Navbar,Welcome,Footer,Services,Transactions,Loader} from "./components";

export const App = () => {
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
      <Navbar />
      <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  );
};
