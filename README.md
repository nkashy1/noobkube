# noobkube

The code in this repository will allow you to test out
[kubernetes](https://kubernetes.io) in the context of deploying and managing
some very simple applications.

The intention here is to provide a bridge between the [kubernetes interactive
tutorials](https://kubernetes.io/docs/tutorials/kubernetes-basics/) and the
rather dense [concept overview](https://kubernetes.io/docs/concepts/), the
rather disparate [tutorials](https://kubernetes.io/docs/tutorials/), and the
rather encyclopaedic [API reference](https://kubernetes.io/docs/reference/).

We will start with a very simple service, which allows its caller to sample from
a uniform distribution, and build out a family of services that build upon it.
In the process, we will experiment with different configurations of the
underlying [Docker](https://www.docker.com/) containers on our kubernetes
clusters.


## Prerequisites

1. [Install `kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
-- kubernetes CLI.

1. [Install `minikube`](https://kubernetes.io/docs/tasks/tools/install-minikube/)
-- Sets up a single-node kubernetes cluster on your local machine (inside a VM).

1. (Optional) [Install `docker`](https://www.docker.com/community-edition) --
Makes it easier for you to test the services locally, especially if you want to
make any modifications of your own.

1. (Optional) [Sign up for an account on DockerHub](https://hub.docker.com/) --
Makes it easy to deploy your containers to your kubernetes cluster.

1. (Optional) [Install node.js `v8.9.3`](https://nodejs.org/en/blog/release/v8.9.3/)
-- Useful if you want to test the services outside of the provided containers,
but certainly not necessary.


## Core service

The `random-server` is the service that lies at the core of our experiments. It
is a very simple service which returns a random number between 0 and 1. If you
would like to see it run and have Docker installed, you can pull the
[image from DockerHub](https://hub.docker.com/r/fuzzyfrog/random-server/):

```
docker pull fuzzyfrog/random-server
```

and then run it on port `<PORT>` (replace this with the port of your choice in the
commands below):

```
docker run -d -p <PORT>:8080 fuzzyfrog/random-server
```

Now you can test the service by calling `curl`:

```
curl localhost:<PORT>
```

This should display a random number between 0 and 1 in your terminal.

If you are curious, you can see the [service implementation](./random-server/index.js)
or its [Dockerfile](./random-server/Dockerfile).

