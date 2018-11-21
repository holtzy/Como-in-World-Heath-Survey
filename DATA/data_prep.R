# ----------
# A script that takes data from Carmen and transform it for the web application
# Run
# ----------

library(tidyverse)
setwd("/Users/y.holtz/Dropbox/QBI/22_WORLD_HEALTH_SURVEY/Como-in-World-Heath-Survey/DATA")


# ----------
# General changes necessary for all charts
# ----------

data <- read.table("data.csv", header=T, sep=",")

# Replace IED by Intermittent explosive disorder
data <- data %>% mutate(Later_disorder = gsub("IED", "Intermittent explosive disorder", Later_disorder))

# Upper case in specific phobia..
data <- data %>% mutate(Later_disorder = gsub("Specific Phobia", "Specific phobia", Later_disorder))

# Save
write.table(data, file="data_clean.csv", quote=F, row.names=F, sep=",")






# ----------
# Preparation for Sankey plot
# ----------

data <- read.table("data.csv", header=T, sep=",")

# Add space to outcome to make it different
tmp <- data %>% mutate( Later_disorder = paste( Later_disorder, " ", sep=""))

# Save it
write.table(tmp, file="data_sankey.csv", quote=F, row.names=F, sep=",")

# Make a data frame with nodes
#nodes = data.frame( ID = c(as.character(unique(tmp$Prior_disorder)), as.character(unique(tmp$Later_disorder)) ) ) %>%

# Make a data frame with the links
#tmp$from <- match(tmp$Prior_disorder, nodes$ID)-1
#tmp$to <- match(tmp$Later_disorder, nodes$ID)-1
# Export to JSON






# ----------
# Preparation for symmetry chart
# ----------

# Read data
data <- read.table("data.csv", header=T, sep=",")

# Watch an example
couple = c("Alcohol dependence", "Drug dependence")
data %>% filter(Later_disorder %in% couple & Prior_disorder %in% couple)

# Merge with opposite direction
tmp <- merge(data, data, by.x=c("Prior_disorder", "Later_disorder"), by.y=c("Later_disorder", "Prior_disorder")) %>%
  mutate(coefVar = (HR.y - HR.x) / max(c(HR.y, HR.x)) * 100)
tmp %>% filter(Later_disorder %in% couple & Prior_disorder %in% couple)

# Clean
dataReady <- tmp %>% select(-7, -8, -9, -10)
colnames(dataReady) <- c(colnames(data), "coefvar")
dataReady %>% head()

# Highest one?
dataReady %>% arrange(coefvar) %>% head()
dataReady %>% arrange(coefvar) %>% tail()

# Export
write.table(dataReady, file="data_bar.csv", quote=F, row.names=F, sep=",")


# ----------
# Preparation for histogram
# ----------

# Step 1: compute position for beeswarm plot
library(beeswarm)
data <- read.table("data.csv", header=T, sep=",")
data$pair <- paste(data$Prior_disorder, data$Later_disorder, sep="-")
a = beeswarm(log(data$HR), method="center", cex=1, corral="none", draw=F)
a

# Step 1: compute position for dotplot histogram
data <- read.table("data.csv", header=T, sep=",")
don = data %>%
  arrange(HR) %>%
  mutate(HR_rounded = round(HR/0.3)*0.3 ) %>%
  mutate(y=ave(HR_rounded, HR_rounded, FUN=seq_along))
don %>% head
# Max tot
milieu = round( max( don$y, na.rm=T) / 2 ) + 0.5

# Max of each category?
tmp <- don %>% group_by(HR_rounded) %>% summarize(nbObs=n())
tmp
don <- merge(don, tmp, by.x="HR_rounded", by.y="HR_rounded")
don
don <- don %>% mutate( yPrim = milieu - round(nbObs/2) + y )
don %>% head(100)

ggplot(don, aes(x=HR_rounded, y=yPrim) ) +
  geom_point( size=2, color="blue" ) +
  xlab('Hazard Ratio') +
  ylab('Number of pair of mental disorder') +
  scale_x_log10()

# Write result
write.table(don, file='/Users/y.holtz/Documents/d3-graph-gallery/DATA/QBI/data_test.csv', row.names=F, quote=F, sep=",")

don
