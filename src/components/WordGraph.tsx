'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Node extends d3.SimulationNodeDatum {
    id: string
    label: string
    val: number
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string
    target: string
}

export default function WordGraph({ data }: { data: { nodes: any[], links: any[] } }) {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length) return

        const width = svgRef.current.clientWidth
        const height = 400

        const svg = d3.select(svgRef.current)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;')

        svg.selectAll('*').remove()

        const simulation = d3.forceSimulation<Node>(data.nodes)
            .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(60))
            .force('charge', d3.forceManyBody().strength(-120))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('x', d3.forceX(width / 2).strength(0.1))
            .force('y', d3.forceY(height / 2).strength(0.1))

        const link = svg.append('g')
            .attr('stroke', 'var(--border-main)')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(data.links)
            .join('line')
            .attr('stroke-width', 1)

        const node = svg.append('g')
            .selectAll('g')
            .data(data.nodes)
            .join('g')
            .call(d3.drag<any, any>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))

        node.append('circle')
            .attr('r', d => Math.sqrt(d.val) * 3 + 4)
            .attr('fill', 'var(--accent-purple)')
            .attr('stroke', 'var(--bg-card)')
            .attr('stroke-width', 2)

        node.append('text')
            .text(d => d.label)
            .attr('x', 12)
            .attr('y', 4)
            .style('font-size', '10px')
            .style('font-weight', '600')
            .style('fill', 'var(--text-muted)')
            .style('pointer-events', 'none')

        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as any).x)
                .attr('y1', d => (d.source as any).y)
                .attr('x2', d => (d.target as any).x)
                .attr('y2', d => (d.target as any).y)

            node
                .attr('transform', d => `translate(${d.x},${d.y})`)
        })

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        }

        function dragged(event: any) {
            event.subject.fx = event.x
            event.subject.fy = event.y
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
        }

        return () => {
            simulation.stop()
        }
    }, [data])

    return (
        <div className="word-graph-container" style={{ width: '100%', height: '400px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Knowledge Synapse Map</span>
                <span style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 600 }}>Interactive Graph</span>
            </div>
            <svg ref={svgRef} style={{ width: '100%', height: '340px' }} />
        </div>
    )
}
