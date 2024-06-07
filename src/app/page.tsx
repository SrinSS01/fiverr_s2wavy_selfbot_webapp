export default async function Home() {
  const users = await fetch("https://studious-broccoli-vr7j4qg6p492xppj-8090.app.github.dev/");
  return (
    <div>Hi mom</div>
  );
}
