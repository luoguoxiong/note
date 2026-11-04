<template>
  <map
    v-if="isLoading"
    id="map"
    style="width: 100%; height: 100vh"
    longitude="113.324520"
    latitude="23.099994"
    scale="14"
    :markers="markers"
    :polyline="polyline"
    :show-location="true"
    @regionchange="regionchange"
    @markertap="markertap"
  />
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import useMap from '../../hooks/useMap'

const isLoading = ref(false)

const { addSendReceiveMarker, markers, polyline, addPolyline } = useMap()

// const markers = reactive([
//   {
//     id: 8,
//     latitude: 23.099994,
//     longitude: 113.32452,
//     width: 50,
//     height: 50,
//     iconLayout: {
//       params: {
//         bgColor: '#8365F6',
//       },
//       src: '/mapLayout/marker_icon.xml',
//     },
//     customCallout: {
//       type: 2,
//       canShowOnTap: true,
//       layout: {
//         params: {
//           label: '寄',
//           title: '待揽件',
//           bgColor: '#8365F6',
//         },
//         src: '/mapLayout/marker_customcallout.xml',
//       },
//       layoutBubble: {
//         style: 'bubble',
//         bgColor: '#ffffff',
//         borderRadius: 10,
//         padding: 0,
//       },
//       isShow: 1,
//     },
//   },
//   {
//     id: 9,
//     latitude: 23.21229,
//     longitude: 113.32452,
//     width: 50,
//     height: 50,
//     iconLayout: {
//       params: {
//         bgColor: '#ffffff',
//       },
//       src: '/mapLayout/marker_icon.xml',
//     },
//     customCallout: {
//       canShowOnTap: true,
//       layout: {
//         params: {
//           label: '收',
//           title: '待揽件',
//           bgColor: '#8365F6',
//         },
//         src: '/mapLayout/marker_customcallout.xml',
//       },
//       layoutBubble: {
//         style: 'bubble',
//         bgColor: '#ffffff',
//         borderRadius: 10,
//         padding: 0,
//       },
//       isShow: 1,
//     },
//   },
// ])

onBeforeMount(() => {
  addSendReceiveMarker({
    id: 8,
    latitude: 23.099994,
    longitude: 113.32452,
    label: '寄',
    title: '待揽件',
    bgColor: '#8365F6',
  })

  addSendReceiveMarker({
    id: 9,
    latitude: 23.21229,
    longitude: 113.32452,
    label: '收',
    title: '待揽件',
    bgColor: '#8365F6',
  })

  addPolyline({
    points: [
      {
        longitude: 113.32452,
        latitude: 23.099994,
      },
      {
        longitude: 113.32452,
        latitude: 23.21229,
      },
    ],
    color: '#8365F6DD',
    width: 6,
    dottedLine: false,
  })

  isLoading.value = true
})

// const polyline = [
//   {
//     points: [
//       {
//         longitude: 113.3245211,
//         latitude: 23.10229,
//       },
//       {
//         longitude: 113.32452,
//         latitude: 23.21229,
//       },
//     ],
//     color: '#FF0000DD',
//     width: 2,
//     dottedLine: true,
//   },
// ]

const regionchange = (e) => {
  console.log(e.type)
}

const markertap = (e) => {
  console.log('markertap:', e.detail.markerId)
}
</script>
