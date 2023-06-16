"use client";
import { useQuery, useMutation } from "../convex/_generated/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import Script from "next/script";
import "chart.js/auto";
import { Pie } from "react-chartjs-2";

function LoginPage() {
  return (
    <main>
      <h1>Dog Spotter</h1>
      <h2>
        <SignInButton />
      </h2>
    </main>
  );
}

function YourDogs() {
  const dogs = useQuery("getDogs");
  return (
    <div className="flex flex-col items-center w-full justify-center">
      <p className="mb-8">Your dogs</p>
      <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        {dogs?.map(({ _id, name, breed, url }) => (
          <div key={_id.toString()}>
            <p>
              {name ? `${name} the ` : "A "}
              {breed}
            </p>
            {url && <img src={url} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function AllDogs() {
  const dogSummary = useQuery("getDogSummary");

  const byLocationData = {
    labels: dogSummary?.byLocation?.map(({ location }) => location),
    datasets: [
      {
        backgroundColor: "#0445AE",
        borderColor: "white",
        data: dogSummary?.byLocation?.map(({ count }) => count),
      },
    ],
  };
  return (
    <div className="flex flex-col items-center w-full justify-center">
      <p className="mb-8">All dogs</p>
      <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        Total dogs spotted: {dogSummary?.count ?? 0}
      </div>
      <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
        {dogSummary && <Pie data={byLocationData} />}
      </div>
    </div>
  );
}

function App() {
  const { user } = useUser();

  const [userId, setUserId] = useState(null);
  const storeUser = useMutation("storeUser");

  useEffect(() => {
    // Store the user in the database.
    // Recall that `storeUser` gets the user information via the `auth`
    // object on the server. You don't need to pass anything manually here.
    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser();
    return () => setUserId(null);
    // Make sure the effect reruns if the user logs in with
    // a different identity
  }, [storeUser]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex">
        <h1 className="flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Dog Spotter
        </h1>
        <div>
          <span>Logged in{user.fullName ? ` as ${user.fullName}` : ""}</span>
          <SignOutButton />
        </div>
      </div>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <YourDogs />
        <div style={{ borderLeft: "1px solid white", height: "500px" }}></div>
        <AllDogs />
      </div>
      <button
        data-tf-slider="vX9noaqM"
        data-tf-position="right"
        data-tf-opacity="100"
        data-tf-iframe-props="title=Spotted a dog"
        data-tf-auto-close="500"
        data-tf-transitive-search-params="user_id"
        data-tf-medium="snippet"
        data-tf-hidden={`user_id=${userId}`}
        className="typeform-button"
      >
        Record a dog sighting
      </button>
      <Script src="//embed.typeform.com/next/embed.js"></Script>
    </main>
  );
}

export default function Home() {
  return (
    <>
      <Authenticated>
        <App />
      </Authenticated>
      <Unauthenticated>
        <LoginPage />
      </Unauthenticated>
    </>
  );
}
