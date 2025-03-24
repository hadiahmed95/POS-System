import LoginForm from "./_components/login-form";

export default function Home() {
  return (
    <div className="flex flex-auto flex-col justify-between h-[100vh] bg-violet-50">
      <div className="relative h-full flex flex-auto flex-col">
          <div className="container mx-auto flex flex-col flex-auto items-center justify-center min-w-0 h-full">
            <div className="bg-white min-w-[320px] md:min-w-[450px] rounded-lg shadow">
              <LoginForm />
            </div>
          </div>
      </div>
    </div>
  );
}
