import React from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import { useVerifyEmail } from "../hooks/useAuth";

const VerifyEmail = () => {
  const { code } = useParams();
  const { verifyEmail, isLoading, error } = useVerifyEmail();
  const [isVerified, setIsVerified] = React.useState(false);

  React.useEffect(() => {
    if (!code) {
      return;
    }

    let ignore = false;

    const runVerification = async () => {
      try {
        await verifyEmail(code);

        if (!ignore) {
          setIsVerified(true);
        }
      } catch {
        if (!ignore) {
          setIsVerified(false);
        }
      }
    };

    runVerification();

    return () => {
      ignore = true;
    };
  }, [code, verifyEmail]);

  return (
    <section className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white/90 p-8 text-center shadow-xl">
        {isLoading ? (
          <>
            <MailCheck className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-5 text-3xl font-bold text-gray-800">
              Verifying email
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we verify your email address.
            </p>
          </>
        ) : isVerified ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="mt-5 text-3xl font-bold text-gray-800">
              Email verified
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your email has been verified successfully.
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h1 className="mt-5 text-3xl font-bold text-gray-800">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {error || "This verification link is invalid or expired."}
            </p>
          </>
        )}

        <Link
          to="/signin"
          className="mt-8 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Go to sign in
        </Link>
      </div>
    </section>
  );
};

export default VerifyEmail;
