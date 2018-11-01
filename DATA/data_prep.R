# A script that takes data from Carmen and transform it for the web application
library(tidyverse)

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
  mutate(HR_rounded = round(HR/0.2)*0.2 ) %>% 
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







