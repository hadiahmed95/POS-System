import LoginForm from "./_components/login-form";

export default function Home() {
  return (
    <div className="flex flex-auto flex-col justify-between min-h-[100vh] bg-gray-50 py-20">
      <div className="relative h-full flex flex-auto flex-col">
          <div className="container mx-auto flex flex-col flex-auto items-center justify-center min-w-0 h-full">
            <div className="bg-white min-w-[320px] md:min-w-[450px] rounded-lg shadow-lg">
              <LoginForm />
            </div>
          </div>
      </div>
    </div>
  );
}
