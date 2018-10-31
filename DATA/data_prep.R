# A script that takes data from Carmen and transform it for the web application

# Step 1: compute position for beeswarm plot
library(beeswarm)
data <- read.table("data.csv", header=T, sep=",")
data$pair <- paste(data$Prior_disorder, data$Later_disorder, sep="-")
a = beeswarm(log(data$HR), method="center", cex=1, corral="none", draw=F)
a
