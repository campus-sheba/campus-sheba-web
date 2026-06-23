module.exports = {
  apps: [
    {
      name: "campus_sheba_prod",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/campus-sheba-web",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "300M"
    }
  ]
}