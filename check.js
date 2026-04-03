async function check() {
  const res = await fetch('https://drive.google.com/uc?export=view&id=1x-w1cYZ9X09NjXbqz_JjqVQXMEIsafE2');
  console.log(res.status);
  console.log(res.headers);
}
check();
