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

```bash
docker pull fuzzyfrog/random-server
```

and then run it on port `<PORT>` (replace this with the port of your choice in the
commands below):

```bash
docker run -d -p <PORT>:8080 fuzzyfrog/random-server
```

Now you can test the service by calling `curl`:

```bash
curl localhost:<PORT>
```

This should display a random number between 0 and 1 in your terminal.

If you are curious, you can see the [service implementation](./random-server/index.js)
or its [Dockerfile](./random-server/Dockerfile).


## minikube cluster

You can bring up your `minikube` cluster by
simply:

```bash
minikube start
```

This will automatically make the `minikube` cluster available to `kubectl`. To
check this, try running

```bash
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

```bash
kubectl config --help
```


## Deploying `random-server` to the minikube cluster

We can deploy our `random-server` application to the minikube cluster using the
`kubectl run` command. We will pull the image from DockerHub:

```bash
kubectl run random --image=fuzzyfrog/random-server:v1
```

Now, you can see that the `random` server has been deployed to your cluster with

```bash
kubectl get deployments
```

Moreover, you should be able to see the pod corresponding to that deployment

```bash
kubectl get pods
```

Although a pod is up and running our `random-server`, this server is not currently
exposed to the world outside minikube cluster. To make it generally available,
we use

```bash
kubectl expose deployment random --type=NodePort --name=random-service --port=8080
```

This exposes the `deployment` as a `service`, which we can see now with

```bash
kubectl get services
```

That tells us which port our containers' ports `8080` are exposed as. Under the
ports column, you should see something like

```
8080:<RANDOM_SERVICE_PORT>/TCP
```

If you do `kubectl cluster-info`, you should also see the IP address at which
your minikube cluster is runnning as

```
https://<CLUSTER_IP>:<IGNORE_THIS_PORT>
```

To make a GET request against our `random-service`, all you have to do now is

```bash
curl ${CLUSTER_IP}:${RANDOM_SERVICE_PORT}
```

You can also scale the deployment of the `random-server`, which was called
`random` (to confirm, try `kubectl get deployment`), using

```bash
kubectl scale deployment/random --replicas=${NUM_REPLICAS}
```

where `${NUM_REPLICAS}` is the number of pods running the `random-server` you
would like to have running on the cluster.


#### Aside

The `-o` (or `--output`) argument to `kubectl get pods` allows you to
meaningfully interact with the table listing pod information. For example,
we can set an environment variable to be the name of pod running our random
service as follows:

```bash
POD_NAME=$(kubectl get pods -o jsonpath="{.items[*].metadata.name}" | grep "random-")
```

There is more information on `jsonpath` formatting [here](https://kubernetes.io/docs/reference/kubectl/jsonpath/).


## Downstream services

With at least one `random-server` instance running on the minikube cluster, let
us define a downstream service that makes use of it.

[`randint-server`](./randint-server/index.js) is an application that accepts
GET requests along the route `/${N}` for a positive integer `N` and, in the
response body, returns a random integer from 0 to N-1 (inclusive). It relies on
a `random-server` instance to generate this integer. I have put an [image for
this server on DockerHub](https://hub.docker.com/r/fuzzyfrog/randint-server/).
You can also see use the [Dockerfile](./randint-server/Dockerfile) directly if
you prefer.

Let us deploy `randint-server` pods to the minikube cluster. Note that
`randint-server` requires the injection of a `random-server` URL using the
`RANDOM_SERVER_URL` environment variable. `kubectl run` allows us to do this
using the `--env` parameter (try `kubectl run --help` for more information).

```bash
kubectl run randint --image=fuzzyfrog/randint-server:v1 --env "RANDOM_SERVER_URL=http://${CLUSTER_IP}:${RANDOM_SERVICE_PORT}"
```

where `${CLUSTER_IP}` and `${RANDOM_SERVICE_PORT}` have the same values as above.

Now

```bash
kubectl get service randint-service
```

will tell you the port on your minikube cluster that connects to ports `8081` on
your `randint` pods, let us call it `${RANDINT_SERVICE_PORT}`. You can now make
calls against the `randint-service` as follows

```bash
curl ${CLUSTER_IP}:${RANDINT_SERVICE_PORT}/42
```

This will return a random integer between 0 and 41 (including possibly 0 or 41).

Just as with `random`, you can scale up your `randint` deployment using

```bash
kubectl scale deployment/randint --replicas=${NUM_RANDINT_REPLICAS}
```

where `${NUM_RANDINT_REPLICAS}` specifies the number of pods you want to bring
up for this deployment.

Note that you can also see the logs for all the pods for your `randint`
deployment (even if you scaled them up using `kubectl scale` as demonstrated
above) using

```bash
kubectl logs -l run=randint
```

These logs aren't particularly meaningful because the version of the application
packaged in the `fuzzyfrog/randint-server:v1` image on DockerHub that we
deployed is particularly poorly implemented. The `fuzzyfrog/randint-server:v2`
image improves upon the logging situation. To update our `randint` deployment
to use this image, we can simply

```bash
kubectl set image deployment/randint randint=fuzzyfrog/randint-server:v2
```

If you had scaled up the number of replicas on your `randint` deployment
earlier, this update will hit all the replicas. The `randint-service` now
spreads its load over the new `randint` pods. To test this, make a few calls
to the service using

```bash
curl ${CLUSTER_IP}:${RANDINT_SERVICE_PORT}/42
```

Change up the `42` if you're feeling particularly wild.

Now run

```bash
kubectl logs -l run=randint
```

The different calls should now be logged in the resulting output. This will
also show you how `randint-service` distributes calls over your pods.