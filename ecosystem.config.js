module.exports = {
  apps: [
    {
      name: "campus_sheba_prod",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/campus-sheba-web",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "300M"
    }
  ]
}