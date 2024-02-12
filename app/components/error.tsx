import { ErrorResponse, Link } from "@remix-run/react";

interface BaseErrorProps {
  reroute?: string;
  rerouteMessage?: string;
}

interface UnhandledErrorProps extends BaseErrorProps {
  error: unknown;
}

interface HandledErrorProps extends BaseErrorProps {
  error: ErrorResponse;
}

export const UnhandledError = ({
  error,
  reroute = "/",
  rerouteMessage = "Return Home",
}: UnhandledErrorProps) => {
  return (
    <>
      <h1 className="text-2xl pb-3">Whoops! Something went wrong.</h1>
      <p>You&apos;re seeing this because an unexpected error occurred.</p>
      {error instanceof Error ? (
        <p className="my-4 font-bold">{error.message}</p>
      ) : null}
      <Link to={reroute} className="text-primary">
        {rerouteMessage}
      </Link>
    </>
  );
};

export const HandledError = ({
  error,
  reroute = "/",
  rerouteMessage = "Return Home",
}: HandledErrorProps) => {
  return (
    <>
      <h1 className="text-2xl pb-3">
        {error.status} - {error.statusText}
      </h1>
      <p>You&apos;re seeing this because an error occurred:</p>
      <p className="my-4 font-bold">{error.data.message}</p>
      <Link to={reroute} className="text-primary">
        {rerouteMessage}
      </Link>
    </>
  );
};
