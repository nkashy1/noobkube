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


## minikube cluster

You can bring up your `minikube` cluster by
simply:

```
minikube start
```

This will automatically make the `minikube` cluster available to `kubectl`. To
check this, try running

```
kubectl cluster-info
```

This should tell you that you have `Kubernetes master` running at a given IP
address. We will make use of this later.

#### Aside

It may seem strange to you that `kubectl` automatically picks up and allows you
to interact with the `minikube` cluster. What if you wanted to interact with some
other cluster instead? All this information can be specified to `kubectl` through
the commands under `kubectl config`. You likely won't have to worry about this
now, but this tidbit of information will come in handy if your kubernetes voyage
takes you past this repo. When you need to work with more than one cluster,
start out with a simple

```
kubectl config --help
```


## Deploying `random-server` to the minikube cluster

We can deploy our `random-server` application to the minikube cluster using the
`kubectl run` command. We will pull the image from DockerHub:

```
kubectl run random --image=fuzzyfrog/random-server
```

Now, you can see that the `random` server has been deployed to your cluster with

```
kubectl get deployments
```

Moreover, you should be able to see the pod corresponding to that deployment

```
kubectl get pods
```

Although a pod is up and running our `random-server`, this server is not currently
exposed to the world outside minikube cluster. To make it generally available,
we use

```
kubectl expose deployment random --type=NodePort --name=random-service --port=8080
```

This exposes the `deployment` as a `service`, which we can see now with

```
kubectl get services
```

That tells us which port our containers' ports `8080` are exposed as. Under the
ports column, you should see something like

```
8080:<EXPOSED_PORT>/TCP
```

If you do `kubectl cluster-info`, you should also see the IP address at which
your minikube cluster is runnning as

```
https://<IP_ADDRESS>:<IGNORE_THIS_PORT>
```

To make a GET request against our `random-service`, all you have to do now is

```
curl <IP_ADDRESS>:<EXPOSED_PORT>
```


#### Aside

The `-o` (or `--output`) argument to `kubectl get pods` allows you to
meaningfully interact with the table listing pod information. For example,
we can set an environment variable to be the name of pod running our random
service as follows:

```
POD_NAME=$(kubectl get pods -o jsonpath="{.items[*].metadata.name}" | grep "random-")
```

There is more information on `jsonpath` formatting [here](https://kubernetes.io/docs/reference/kubectl/jsonpath/).


